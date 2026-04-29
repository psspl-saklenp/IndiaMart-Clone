'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getMyProfile, updateMyProfile } from '@/features/sellers/api';
import { uploadFile } from '@/features/uploads/api';
import type { UpdateMyProfilePayload } from '@/types/dashboard';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024;

export function ProfileEditor() {
  const qc = useQueryClient();
  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['my-seller-profile'],
    queryFn: getMyProfile,
  });

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [description, setDescription] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  const [imgError, setImgError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Hydrate form state once when the profile loads.
  useEffect(() => {
    if (!profile) return;
    setCompanyName(profile.companyName);
    setBusinessType(profile.businessType ?? '');
    setEstablishedYear(profile.establishedYear ? String(profile.establishedYear) : '');
    setDescription(profile.description ?? '');
    setGstNumber(profile.gstNumber ?? '');
    setLogoUrl(profile.logoUrl);
    setBannerUrl(profile.bannerUrl);
  }, [profile]);

  const saveMut = useMutation({
    mutationFn: (payload: UpdateMyProfilePayload) => updateMyProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-seller-profile'] });
      setSavedAt(Date.now());
    },
  });

  async function pickAndUpload(
    e: ChangeEvent<HTMLInputElement>,
    purpose: 'avatar' | 'banner',
    onUploaded: (url: string) => void,
  ) {
    setImgError(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ALLOWED.has(file.type)) {
      setImgError(`Unsupported type: ${file.type}.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setImgError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`);
      return;
    }
    try {
      const result = await uploadFile(file, purpose);
      onUploaded(result.url);
    } catch (err) {
      setImgError(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavedAt(null);
    const payload: UpdateMyProfilePayload = {
      companyName: companyName.trim(),
      ...(businessType ? { businessType: businessType.trim() } : { businessType: '' }),
      ...(establishedYear ? { establishedYear: Number(establishedYear) } : {}),
      description: description.trim(),
      gstNumber: gstNumber.trim(),
      ...(logoUrl ? { logoUrl } : {}),
      ...(bannerUrl ? { bannerUrl } : {}),
    };
    saveMut.mutate(payload);
  }

  if (isLoading) return <p className="text-sm text-ink-500">Loading profile…</p>;
  if (isError || !profile) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error instanceof Error ? error.message : 'Failed to load profile'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">My profile</h1>
        <p className="mt-1 text-sm text-ink-500">
          This is what buyers see on your{' '}
          <Link
            href={`/supplier/${profile.slug}`}
            className="text-brand-700 hover:underline"
          >
            public supplier page
          </Link>
          .
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {profile.isVerifiedSupplier && <Badge tone="brand">Verified Supplier</Badge>}
          {Number(profile.ratingAvg) > 0 && (
            <Badge tone="success">
              ★ {Number(profile.ratingAvg).toFixed(1)} ({profile.ratingCount})
            </Badge>
          )}
          <span className="text-ink-500">Slug: {profile.slug}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="space-y-3 rounded-lg border border-ink-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-ink-900">Branding</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImagePicker
              label="Logo"
              hint="Square image works best. Up to 5 MB."
              src={logoUrl}
              onPick={(e) => pickAndUpload(e, 'avatar', setLogoUrl)}
              onClear={() => setLogoUrl(null)}
              square
            />
            <ImagePicker
              label="Banner"
              hint="Wide image works best (3:1 ratio). Up to 5 MB."
              src={bannerUrl}
              onPick={(e) => pickAndUpload(e, 'banner', setBannerUrl)}
              onClear={() => setBannerUrl(null)}
            />
          </div>

          {imgError && (
            <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
              {imgError}
            </p>
          )}
        </section>

        <section className="space-y-4 rounded-lg border border-ink-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-ink-900">Business details</h2>

          <Input
            name="companyName"
            label="Company name"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            minLength={2}
            maxLength={180}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="businessType"
              label="Business type"
              hint="e.g. Manufacturer, Distributor, Trader"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              maxLength={80}
            />
            <Input
              name="establishedYear"
              label="Established year"
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              value={establishedYear}
              onChange={(e) => setEstablishedYear(e.target.value)}
            />
          </div>

          <Input
            name="gstNumber"
            label="GST number (optional)"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
            maxLength={32}
          />

          <Textarea
            name="description"
            label="About your business"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            hint="A short pitch buyers will see on your supplier page."
          />
        </section>

        {saveMut.isError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {saveMut.error instanceof Error ? saveMut.error.message : 'Save failed'}
          </div>
        )}

        {savedAt && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Saved.
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Link href={`/supplier/${profile.slug}`}>
            <Button type="button" variant="secondary">
              View public page
            </Button>
          </Link>
          <Button type="submit" loading={saveMut.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

function ImagePicker({
  label,
  hint,
  src,
  onPick,
  onClear,
  square,
}: {
  label: string;
  hint: string;
  src: string | null;
  onPick: (e: ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  onClear: () => void;
  square?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-ink-700">{label}</p>
      <div
        className={`flex w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-ink-300 bg-ink-50 ${
          square ? 'aspect-square max-w-48' : 'aspect-[3/1]'
        }`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-ink-400">No {label.toLowerCase()} yet</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50">
          {src ? 'Replace' : 'Upload'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onPick}
            className="hidden"
          />
        </label>
        {src && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-red-600 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
      <p className="text-[11px] text-ink-500">{hint}</p>
    </div>
  );
}
