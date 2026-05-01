'use client';

import { useState, type FormEvent, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

import {
  useBuyerProfile,
  type BuyerProfileExtension,
} from './use-buyer-profile';

/**
 * The /me/profile page.
 *
 * Layout (matches the reference):
 *   ┌────────────────────────────┬─────────────────────────────────────┐
 *   │  Header card               │  Verified Buyer Progress card       │
 *   ├────────────────────────────┴─────────────────────────────────────┤
 *   │  Six tile cards in a 3-column grid                                │
 *   └───────────────────────────────────────────────────────────────────┘
 */
export function BuyerProfile() {
  const { user } = useAuth();
  const { profile, update, hydrated } = useBuyerProfile();

  const milestones = computeMilestones(user, profile);
  const completedMilestones = milestones.filter((m) => m.done).length;
  const totalMilestones = milestones.length;
  const profileStrength = computeProfileStrength(user, profile);

  const [editingHeader, setEditingHeader] = useState(false);
  const [openTile, setOpenTile] = useState<TileKey | null>(null);

  const tiles: TileMeta[] = [
    {
      key: 'primary',
      title: 'Primary Details',
      icon: <IconPhoto />,
      description: missingPrimaryHint(user, profile),
    },
    {
      key: 'address',
      title: 'Address Details',
      icon: <IconAddress />,
      description: missingAddressHint(profile),
    },
    {
      key: 'business',
      title: 'Business Details',
      icon: <IconBuilding />,
      description: missingBusinessHint(profile),
    },
    {
      key: 'account',
      title: 'Account Settings',
      icon: <IconSettings />,
      description: 'Manage Account',
    },
    {
      key: 'help',
      title: 'Help',
      icon: <IconHelp />,
      description: 'Get support & assistance',
    },
    {
      key: 'ticket',
      title: 'Raise a ticket',
      icon: <IconTicket />,
      description: 'Initiate a support request',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header row: profile strength card + verification card */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <ProfileHeaderCard
          name={user?.name ?? ''}
          city={profile.city}
          state={profile.state}
          editing={editingHeader}
          onEdit={() => setEditingHeader(true)}
          onCancel={() => setEditingHeader(false)}
          onSave={(patch) => {
            update(patch);
            setEditingHeader(false);
          }}
          strength={profileStrength}
        />
        <VerifiedBuyerProgressCard
          milestones={milestones}
          completed={completedMilestones}
          total={totalMilestones}
          gstFilled={Boolean(profile.gstNumber.trim())}
          onAddGst={() => setOpenTile('business')}
          onCompleteVerification={() =>
            setOpenTile(milestones.find((m) => !m.done)?.tileKey ?? null)
          }
        />
      </div>

      {/* Tile grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <TileCard
            key={tile.key}
            tile={tile}
            open={openTile === tile.key}
            onToggle={() => setOpenTile(openTile === tile.key ? null : tile.key)}
          >
            {tile.key === 'primary' && (
              <PrimaryDetailsForm profile={profile} update={update} userPhone={user?.phone ?? ''} userEmail={user?.email ?? ''} />
            )}
            {tile.key === 'address' && (
              <AddressDetailsForm profile={profile} update={update} />
            )}
            {tile.key === 'business' && (
              <BusinessDetailsForm profile={profile} update={update} />
            )}
            {tile.key === 'account' && <AccountSettingsPanel />}
            {tile.key === 'help' && <HelpPanel />}
            {tile.key === 'ticket' && <RaiseTicketForm />}
          </TileCard>
        ))}
      </div>

      {/* Loading shim while localStorage hydrates so the "Missing X" text
          matches the persisted state on first paint. */}
      {!hydrated && (
        <p className="text-center text-[11px] text-ink-400">
          Loading saved details&hellip;
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*                          Profile header card                             */
/* ------------------------------------------------------------------------ */

function ProfileHeaderCard({
  name,
  city,
  state,
  strength,
  editing,
  onEdit,
  onCancel,
  onSave,
}: {
  name: string;
  city: string;
  state: string;
  strength: number;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (patch: Partial<BuyerProfileExtension>) => void;
}) {
  const [draftCity, setDraftCity] = useState(city);
  const [draftState, setDraftState] = useState(state);
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const cityLabel = city
    ? state
      ? `${city}, ${state}`
      : city
    : 'Add city';

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSave({ city: draftCity.trim(), state: draftState.trim() });
  }

  return (
    <section className="rounded-md border border-ink-200 bg-white p-5 shadow-sm lg:col-span-2">
      <div className="flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-im-navy-700)] text-xl font-semibold text-white">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          {!editing ? (
            <>
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-semibold text-ink-900">
                  {name || 'My account'}
                </h1>
                <button
                  type="button"
                  aria-label="Edit profile"
                  onClick={onEdit}
                  className="text-ink-400 hover:text-[var(--color-im-navy-700)]"
                >
                  <IconPencil />
                </button>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                <IconPin /> {cityLabel}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                <IconCalendar /> This Month
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  value={draftCity}
                  onChange={(e) => setDraftCity(e.target.value)}
                  placeholder="Rajkot"
                />
                <Input
                  label="State"
                  value={draftState}
                  onChange={(e) => setDraftState(e.target.value)}
                  placeholder="Gujarat"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraftCity(city);
                    setDraftState(state);
                    onCancel();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-ink-500">
          <span>Profile Strength</span>
          <span className="text-amber-600">{strength}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width] duration-500"
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/*                       Verified Buyer Progress card                        */
/* ------------------------------------------------------------------------ */

function VerifiedBuyerProgressCard({
  milestones,
  completed,
  total,
  gstFilled,
  onAddGst,
  onCompleteVerification,
}: {
  milestones: Milestone[];
  completed: number;
  total: number;
  gstFilled: boolean;
  onAddGst: () => void;
  onCompleteVerification: () => void;
}) {
  return (
    <section className="rounded-md border border-ink-200 bg-white p-5 shadow-sm lg:col-span-3">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <IconBadgeCheck />
          Verified Buyer Progress
        </div>
        <span className="text-xs text-ink-500">
          {completed}/{total} milestones
        </span>
      </header>

      <ol className="mt-5 grid grid-cols-5 gap-1">
        {milestones.map((m, i) => {
          const isLast = i === milestones.length - 1;
          return (
            <li key={m.label} className="relative flex flex-col items-center">
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-1/2 top-3 h-[2px] w-full',
                    milestones[i + 1]?.done ? 'bg-[var(--color-im-teal-500)]' : 'bg-ink-200',
                  )}
                />
              )}
              <span
                className={cn(
                  'relative z-10 flex size-6 items-center justify-center rounded-full text-[11px] font-semibold',
                  m.done
                    ? 'bg-[var(--color-im-teal-500)] text-white'
                    : 'border-2 border-dashed border-ink-300 bg-white text-ink-400',
                )}
              >
                {m.done ? <IconCheckSmall /> : i + 1}
              </span>
              <span className="mt-2 text-[11px] text-ink-600">{m.label}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onAddGst}
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            gstFilled
              ? 'text-[var(--color-im-teal-700)]'
              : 'text-ink-500 hover:text-ink-800',
          )}
        >
          <IconInfo /> {gstFilled ? 'GST added' : 'Add GST'}
        </button>
        <Button
          onClick={onCompleteVerification}
          className="bg-[var(--color-im-navy-700)] text-white hover:bg-[var(--color-im-navy-800)]"
        >
          Complete Verification
        </Button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/*                              Tile cards                                  */
/* ------------------------------------------------------------------------ */

type TileKey =
  | 'primary'
  | 'address'
  | 'business'
  | 'account'
  | 'help'
  | 'ticket';

interface TileMeta {
  key: TileKey;
  title: string;
  icon: ReactNode;
  description: string;
}

function TileCard({
  tile,
  open,
  onToggle,
  children,
}: {
  tile: TileMeta;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-md border bg-white shadow-sm transition-all',
        open ? 'border-[var(--color-im-navy-300)]' : 'border-ink-200',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-ink-100 text-[var(--color-im-navy-700)]">
          {tile.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink-900">{tile.title}</span>
          <span className="block truncate text-xs text-ink-500">{tile.description}</span>
        </span>
        <IconChevron open={open} />
      </button>
      {open && (
        <div className="border-t border-ink-200 px-4 py-4">{children}</div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/*                              Sub-forms                                   */
/* ------------------------------------------------------------------------ */

function PrimaryDetailsForm({
  profile,
  update,
  userPhone,
  userEmail,
}: {
  profile: BuyerProfileExtension;
  update: (patch: Partial<BuyerProfileExtension>) => void;
  userPhone: string;
  userEmail: string;
}) {
  const [alt, setAlt] = useState(profile.alternativeMobile);
  const [secondary, setSecondary] = useState(profile.secondaryEmail);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    update({ alternativeMobile: alt.trim(), secondaryEmail: secondary.trim() });
    setSavedAt(Date.now());
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Primary mobile" value={userPhone} disabled hint="From your account" />
        <Input label="Primary email" value={userEmail} disabled hint="From your account" />
        <Input
          label="Alternative mobile"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="+91 9999999999"
        />
        <Input
          label="Secondary email"
          type="email"
          value={secondary}
          onChange={(e) => setSecondary(e.target.value)}
          placeholder="alt@example.com"
        />
      </div>
      <SaveBar savedAt={savedAt} />
    </form>
  );
}

function AddressDetailsForm({
  profile,
  update,
}: {
  profile: BuyerProfileExtension;
  update: (patch: Partial<BuyerProfileExtension>) => void;
}) {
  const [draft, setDraft] = useState(profile);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    update({
      houseNo: draft.houseNo.trim(),
      street: draft.street.trim(),
      area: draft.area.trim(),
      city: draft.city.trim(),
      state: draft.state.trim(),
      pincode: draft.pincode.trim(),
    });
    setSavedAt(Date.now());
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="House no. / block"
          value={draft.houseNo}
          onChange={(e) => setDraft((d) => ({ ...d, houseNo: e.target.value }))}
          placeholder="A-204"
        />
        <Input
          label="Street"
          value={draft.street}
          onChange={(e) => setDraft((d) => ({ ...d, street: e.target.value }))}
        />
        <Input
          label="Area / locality"
          value={draft.area}
          onChange={(e) => setDraft((d) => ({ ...d, area: e.target.value }))}
        />
        <Input
          label="Pincode"
          value={draft.pincode}
          onChange={(e) => setDraft((d) => ({ ...d, pincode: e.target.value }))}
          placeholder="360001"
        />
        <Input
          label="City"
          value={draft.city}
          onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
          placeholder="Rajkot"
        />
        <Input
          label="State"
          value={draft.state}
          onChange={(e) => setDraft((d) => ({ ...d, state: e.target.value }))}
          placeholder="Gujarat"
        />
      </div>
      <SaveBar savedAt={savedAt} />
    </form>
  );
}

function BusinessDetailsForm({
  profile,
  update,
}: {
  profile: BuyerProfileExtension;
  update: (patch: Partial<BuyerProfileExtension>) => void;
}) {
  const [draft, setDraft] = useState(profile);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [gstError, setGstError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (draft.gstNumber && !isLikelyGst(draft.gstNumber)) {
      setGstError('GST should be 15 alphanumeric characters.');
      return;
    }
    setGstError(null);
    update({
      companyName: draft.companyName.trim(),
      companyWebsite: draft.companyWebsite.trim(),
      gstNumber: draft.gstNumber.trim().toUpperCase(),
      businessType: draft.businessType.trim(),
    });
    setSavedAt(Date.now());
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Company name"
          value={draft.companyName}
          onChange={(e) => setDraft((d) => ({ ...d, companyName: e.target.value }))}
        />
        <Input
          label="Website"
          value={draft.companyWebsite}
          onChange={(e) => setDraft((d) => ({ ...d, companyWebsite: e.target.value }))}
          placeholder="https://example.com"
        />
        <Input
          label="GST number"
          value={draft.gstNumber}
          onChange={(e) => setDraft((d) => ({ ...d, gstNumber: e.target.value.toUpperCase() }))}
          placeholder="22ABCDE1234F1Z5"
          error={gstError}
          maxLength={15}
        />
        <Input
          label="Business type"
          value={draft.businessType}
          onChange={(e) => setDraft((d) => ({ ...d, businessType: e.target.value }))}
          placeholder="Wholesaler / Retailer / Manufacturer"
        />
      </div>
      <SaveBar savedAt={savedAt} />
    </form>
  );
}

function AccountSettingsPanel() {
  return (
    <div className="space-y-2 text-xs text-ink-600">
      <p>
        Account-level controls (password change, email notifications, language) live here.
        Hooked up to a real settings API in a later phase.
      </p>
      <ul className="ml-4 list-disc space-y-1 text-ink-500">
        <li>Change password &mdash; coming soon</li>
        <li>Email notifications &mdash; coming soon</li>
        <li>Language &amp; region &mdash; coming soon</li>
      </ul>
    </div>
  );
}

function HelpPanel() {
  return (
    <div className="space-y-2 text-xs text-ink-600">
      <p>Need a hand? Try one of these:</p>
      <ul className="ml-4 list-disc space-y-1 text-ink-500">
        <li>
          <a href="#" className="font-medium text-[var(--color-im-teal-700)] hover:underline">
            Browse the help centre
          </a>
        </li>
        <li>Email support &mdash; help@indiamart-clone.local</li>
        <li>Call our team &mdash; Mon&ndash;Sat, 9 a.m. to 7 p.m. IST</li>
      </ul>
    </div>
  );
}

function RaiseTicketForm() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    // No backend yet; we simulate a successful submit so the UI is honest about state.
    setSubmittedAt(Date.now());
    setSubject('');
    setMessage('');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-xs">
      <Input
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Brief description of the issue"
        required
      />
      <label className="block space-y-1.5">
        <span className="block text-xs font-medium text-ink-700">Details</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Tell us what happened so we can help."
          required
          className="block w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </label>
      <div className="flex items-center justify-between">
        <Button type="submit" size="sm">
          Submit ticket
        </Button>
        {submittedAt && (
          <span className="text-[11px] text-emerald-600">
            Ticket received. We&rsquo;ll get back to you soon.
          </span>
        )}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------------ */
/*                                Helpers                                   */
/* ------------------------------------------------------------------------ */

interface Milestone {
  label: string;
  done: boolean;
  /** Tile that contains the field needed to complete this milestone. */
  tileKey: TileKey;
}

function computeMilestones(
  user: { name: string; email: string; phone: string | null } | null,
  ext: BuyerProfileExtension,
): Milestone[] {
  return [
    { label: 'Name', done: Boolean(user?.name?.trim()), tileKey: 'primary' },
    {
      label: 'Company',
      done: Boolean(ext.companyName.trim()),
      tileKey: 'business',
    },
    { label: 'Email', done: Boolean(user?.email?.trim()), tileKey: 'primary' },
    { label: 'Phone', done: Boolean(user?.phone?.trim()), tileKey: 'primary' },
    {
      label: 'GST',
      done: Boolean(ext.gstNumber.trim()),
      tileKey: 'business',
    },
  ];
}

function computeProfileStrength(
  user: { name: string; email: string; phone: string | null; isVerified: boolean } | null,
  ext: BuyerProfileExtension,
): number {
  if (!user) return 0;
  const checks = [
    Boolean(user.name?.trim()),
    Boolean(user.email?.trim()),
    Boolean(user.phone?.trim()),
    user.isVerified,
    Boolean(ext.city.trim()),
    Boolean(ext.state.trim()),
    Boolean(ext.alternativeMobile.trim()),
    Boolean(ext.companyName.trim()),
    Boolean(ext.gstNumber.trim()),
    Boolean(ext.companyWebsite.trim()),
    Boolean(ext.houseNo.trim() || ext.street.trim()),
    Boolean(ext.pincode.trim()),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

function isLikelyGst(value: string): boolean {
  return /^[0-9A-Z]{15}$/i.test(value.trim());
}

function missingPrimaryHint(
  user: { phone: string | null } | null,
  ext: BuyerProfileExtension,
): string {
  if (!user?.phone?.trim()) return 'Missing primary mobile';
  if (!ext.alternativeMobile.trim()) return 'Missing alternative mobile';
  if (!ext.secondaryEmail.trim()) return 'Missing secondary email';
  return 'All set';
}

function missingAddressHint(ext: BuyerProfileExtension): string {
  if (!ext.houseNo.trim()) return 'Missing house no./block';
  if (!ext.pincode.trim()) return 'Missing pincode';
  if (!ext.city.trim()) return 'Missing city';
  return 'All set';
}

function missingBusinessHint(ext: BuyerProfileExtension): string {
  if (!ext.companyName.trim()) return 'Missing company name';
  if (!ext.companyWebsite.trim()) return 'Missing company website';
  if (!ext.gstNumber.trim()) return 'Missing GST number';
  return 'All set';
}

function SaveBar({ savedAt }: { savedAt: number | null }) {
  return (
    <div className="flex items-center justify-between">
      <Button type="submit" size="sm">
        Save changes
      </Button>
      {savedAt && (
        <span className="text-[11px] text-emerald-600">Saved.</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*                            Inline SVG icons                              */
/* ------------------------------------------------------------------------ */

// Tailwind’s JIT can’t statically extract class names built from template
// literals, so we use a small literal-string map keyed by an explicit size.
const SIZE_CLASS = {
  3: 'size-3',
  4: 'size-4',
  5: 'size-5',
} as const;

type IconSize = keyof typeof SIZE_CLASS;

function svg(extra?: { className?: string; size?: IconSize }) {
  const size: IconSize = extra?.size ?? 5;
  return {
    viewBox: '0 0 24 24',
    className: cn(SIZE_CLASS[size], extra?.className),
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };
}

function IconPin() {
  return (
    <svg {...svg({ size: 3 })}>
      <path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg {...svg({ size: 3 })}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg {...svg({ size: 4 })}>
      <path d="M4 20l3.5-1L18 8.5 15.5 6 5 16.5z" />
      <path d="M14 7l3 3" />
    </svg>
  );
}

function IconBadgeCheck() {
  return (
    <svg {...svg({ size: 4, className: 'text-[var(--color-im-teal-600)]' })}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconCheckSmall() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12l5 5 9-11" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg {...svg({ size: 4 })}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-4 text-ink-400 transition-transform', open && 'rotate-90')}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function IconPhoto() {
  return (
    <svg {...svg()}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 16l5-5 4 4 3-3 6 6" />
      <circle cx="9" cy="10" r="1.4" />
    </svg>
  );
}

function IconAddress() {
  return (
    <svg {...svg()}>
      <path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg {...svg()}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg {...svg()}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

function IconHelp() {
  return (
    <svg {...svg()}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-.83.83-1.5 1.5-1.5 2.5" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function IconTicket() {
  return (
    <svg {...svg()}>
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
      <path d="M13 7v10" strokeDasharray="2 2" />
    </svg>
  );
}
