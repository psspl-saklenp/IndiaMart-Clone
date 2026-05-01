'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const POPULAR_PICKUP = ['Mumbai', 'Morbi', 'Delhi', 'Pune'];
const POPULAR_DROP = ['Ahmedabad', 'Mumbai', 'Rajkot'];

type Weight = 'upto-3' | '3-9' | '9-18' | 'more-18';
type MaterialType =
  | 'industrial'
  | 'construction'
  | 'household'
  | 'agriculture'
  | 'vehicles'
  | 'other';
type TruckType = '22' | '24-26' | '32';

const WEIGHT_OPTIONS: { id: Weight; label: string }[] = [
  { id: 'upto-3', label: 'Upto 3 Ton' },
  { id: '3-9', label: '3 to 9 Ton' },
  { id: '9-18', label: '9 to 18 Ton' },
  { id: 'more-18', label: 'More than 18 Ton' },
];

const MATERIAL_OPTIONS: { id: MaterialType; label: string }[] = [
  { id: 'industrial', label: 'Industrial Machinery' },
  { id: 'construction', label: 'Construction Material' },
  { id: 'household', label: 'Household Goods' },
  { id: 'agriculture', label: 'Agriculture Products' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'other', label: 'Other' },
];

const TRUCK_OPTIONS: { id: TruckType; label: string }[] = [
  { id: '22', label: '22 Feet' },
  { id: '24-26', label: '24 / 26 Feet' },
  { id: '32', label: '32 Feet' },
];

interface Transporter {
  id: string;
  name: string;
  /** Letters used inside the placeholder logo tile. */
  initials: string;
  /** Tailwind classes used to colour the placeholder logo. */
  logoBg: string;
  logoFg: string;
  address: string;
  trustSealVerified: boolean;
  rating: number;
  reviewCount: number;
  priceApprox: number;
  responseRate: number;
  phone: string;
}

/**
 * Fictional transporters used as placeholder data. None of these are real
 * companies; names are generic so we don't reference any third-party brand.
 */
const TRANSPORTERS: Transporter[] = [
  {
    id: 't-1',
    name: 'BlueWheel Logistics',
    initials: 'BW',
    logoBg: 'bg-emerald-100',
    logoFg: 'text-emerald-700',
    address: 'Dilshad Garden, New Delhi',
    trustSealVerified: true,
    rating: 4.4,
    reviewCount: 102,
    priceApprox: 22_000,
    responseRate: 87,
    phone: '+91 98xxxx1102',
  },
  {
    id: 't-2',
    name: 'SafeHaul Roadways',
    initials: 'SH',
    logoBg: 'bg-amber-100',
    logoFg: 'text-amber-700',
    address: 'Dilshad Garden, New Delhi',
    trustSealVerified: true,
    rating: 3.9,
    reviewCount: 23,
    priceApprox: 30_000,
    responseRate: 87,
    phone: '+91 98xxxx2204',
  },
  {
    id: 't-3',
    name: 'Gateway Roadlines',
    initials: 'GR',
    logoBg: 'bg-rose-100',
    logoFg: 'text-rose-700',
    address: 'New Delhi',
    trustSealVerified: true,
    rating: 4.5,
    reviewCount: 23,
    priceApprox: 30_500,
    responseRate: 51,
    phone: '+91 98xxxx3306',
  },
  {
    id: 't-4',
    name: 'Northern Cargo Co.',
    initials: 'NC',
    logoBg: 'bg-sky-100',
    logoFg: 'text-sky-700',
    address: 'Karol Bagh, New Delhi',
    trustSealVerified: false,
    rating: 4.1,
    reviewCount: 58,
    priceApprox: 28_750,
    responseRate: 73,
    phone: '+91 98xxxx4408',
  },
  {
    id: 't-5',
    name: 'TrailBlaze Logistics LLP',
    initials: 'TB',
    logoBg: 'bg-violet-100',
    logoFg: 'text-violet-700',
    address: 'Dwarka Sector 21, New Delhi',
    trustSealVerified: true,
    rating: 4.7,
    reviewCount: 41,
    priceApprox: 24_900,
    responseRate: 92,
    phone: '+91 98xxxx5510',
  },
];

interface Submission {
  pickup: string;
  drop: string;
  weight: Weight;
  weightLabel: string;
  material: MaterialType;
  materialLabel: string;
  truck: TruckType;
  truckLabel: string;
  ts: number;
}

/**
 * "Book Transportation Service" two-step wizard. Only Full Truck is offered;
 * Part Truck and Courier are intentionally omitted.
 *
 * Step 1 — cities + material weight
 * Step 2 — material type + truck type
 * After Step 2 submit, a summary card replaces the form.
 */
export function BuyerShip() {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [pickup, setPickup] = useState('Rajkot');
  const [drop, setDrop] = useState('Ahmedabad');
  const [weight, setWeight] = useState<Weight>('9-18');
  const [errors, setErrors] = useState<{ pickup?: string; drop?: string }>({});

  // Step 2 state
  const [material, setMaterial] = useState<MaterialType | null>(null);
  const [truck, setTruck] = useState<TruckType | null>(null);
  const [step2Errors, setStep2Errors] = useState<{ material?: string; truck?: string }>({});

  // Final state
  const [submitted, setSubmitted] = useState<Submission | null>(null);

  function onStep1Submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!pickup.trim()) next.pickup = 'Enter your pickup city';
    if (!drop.trim()) next.drop = 'Enter your drop city';
    if (pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
      next.drop = 'Pickup and drop cannot be the same city';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStep(2);
  }

  function onStep2Submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: typeof step2Errors = {};
    if (!material) next.material = 'Select the type of material you are shipping';
    if (!truck) next.truck = 'Choose a truck size';
    setStep2Errors(next);
    if (Object.keys(next).length > 0) return;

    const weightMeta = WEIGHT_OPTIONS.find((w) => w.id === weight);
    const materialMeta = MATERIAL_OPTIONS.find((m) => m.id === material);
    const truckMeta = TRUCK_OPTIONS.find((t) => t.id === truck);
    setSubmitted({
      pickup: pickup.trim(),
      drop: drop.trim(),
      weight,
      weightLabel: weightMeta?.label ?? '',
      material: material!,
      materialLabel: materialMeta?.label ?? '',
      truck: truck!,
      truckLabel: truckMeta?.label ?? '',
      ts: Date.now(),
    });
  }

  function reset() {
    setSubmitted(null);
    setErrors({});
    setStep2Errors({});
    setStep(1);
    // Keep cities/weight as the user last entered them so they don't have to retype.
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-md border border-ink-200 bg-gradient-to-br from-[var(--color-im-navy-700)] via-[var(--color-im-navy-800)] to-[var(--color-im-navy-900)] px-6 py-12 text-center text-white shadow-sm">
        <h1 className="text-2xl font-bold sm:text-3xl">Book Transportation Service</h1>
        <p className="mt-1 text-xs text-white/75 sm:text-sm">
          Quick quotes for full-truck-load shipments across India.
        </p>

        {/* Service tile (only Full Truck) */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            disabled
            aria-pressed
            className="flex flex-col items-center gap-2 rounded-md border-2 border-[var(--color-im-teal-400)] bg-white px-6 py-4 text-ink-900 shadow-md"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-im-teal-50)] text-[var(--color-im-teal-700)]">
              <TruckIcon />
            </span>
            <span className="text-sm font-semibold">Full Truck</span>
            <span className="text-[11px] text-ink-500">More than 2.5 Tons</span>
          </button>
        </div>
      </section>

      {/* Form OR results */}
      {submitted ? (
        <TransporterResults
          submission={submitted}
          transporters={TRANSPORTERS}
          onEdit={reset}
        />
      ) : (
        <section className="relative rounded-md border border-ink-200 bg-white p-5 shadow-sm sm:p-8">
          <header className="flex items-center justify-center">
            {step === 2 && (
              <button
                type="button"
                aria-label="Back to shipment basics"
                onClick={() => setStep(1)}
                className="absolute left-6 mt-0.5 rounded-md p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-800 sm:left-10"
              >
                <BackArrow />
              </button>
            )}
            <h2 className="text-center text-base font-semibold text-ink-900">
              Enter Your Shipment Details
            </h2>
          </header>

          {step === 1 ? (
            <form onSubmit={onStep1Submit} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-start">
                <CityInput
                  id="pickup"
                  label="Pickup City"
                  value={pickup}
                  onChange={setPickup}
                  popular={POPULAR_PICKUP}
                  error={errors.pickup}
                />
                <div className="hidden self-center pt-7 lg:block">
                  <Arrow />
                </div>
                <CityInput
                  id="drop"
                  label="Drop City"
                  value={drop}
                  onChange={setDrop}
                  popular={POPULAR_DROP}
                  error={errors.drop}
                  highlightedChip={drop}
                />
                <div className="hidden lg:block" />
                <fieldset>
                  <legend className="flex items-center gap-1 text-xs font-semibold text-ink-700">
                    Material Weight <span className="text-red-500">*</span>
                    <InfoIcon />
                  </legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {WEIGHT_OPTIONS.map((w) => (
                      <RadioPill
                        key={w.id}
                        name="weight"
                        value={w.id}
                        label={w.label}
                        checked={weight === w.id}
                        onChange={() => setWeight(w.id)}
                      />
                    ))}
                  </div>
                </fieldset>
              </div>

              <StepDots step={1} />

              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="bg-[var(--color-im-teal-600)] px-12 hover:bg-[var(--color-im-teal-700)]"
                  size="lg"
                >
                  Submit
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={onStep2Submit} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Material Type */}
                <fieldset>
                  <legend className="flex items-center gap-2 text-xs font-semibold text-ink-700">
                    <span aria-hidden className="text-base">📦</span>
                    Material Type <span className="text-red-500">*</span>
                  </legend>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {MATERIAL_OPTIONS.map((m) => (
                      <RadioPill
                        key={m.id}
                        name="material"
                        value={m.id}
                        label={m.label}
                        checked={material === m.id}
                        onChange={() => setMaterial(m.id)}
                      />
                    ))}
                  </div>
                  {step2Errors.material && (
                    <p className="mt-2 text-xs text-red-600">{step2Errors.material}</p>
                  )}
                </fieldset>

                {/* Truck Type */}
                <fieldset>
                  <legend className="flex items-center gap-2 text-xs font-semibold text-ink-700">
                    <span aria-hidden className="text-base">🚚</span>
                    Truck Type <span className="text-red-500">*</span>
                  </legend>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {TRUCK_OPTIONS.map((t) => (
                      <RadioPill
                        key={t.id}
                        name="truck"
                        value={t.id}
                        label={t.label}
                        checked={truck === t.id}
                        onChange={() => setTruck(t.id)}
                      />
                    ))}
                  </div>
                  {step2Errors.truck && (
                    <p className="mt-2 text-xs text-red-600">{step2Errors.truck}</p>
                  )}
                </fieldset>
              </div>

              <StepDots step={2} />

              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="bg-[var(--color-im-teal-600)] px-12 hover:bg-[var(--color-im-teal-700)]"
                  size="lg"
                >
                  Find Transporters
                </Button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*                          Shared form atoms                               */
/* ------------------------------------------------------------------------ */

function RadioPill({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors',
        checked
          ? 'border-[var(--color-im-teal-500)] bg-[var(--color-im-teal-50)] text-[var(--color-im-teal-800)]'
          : 'border-ink-200 text-ink-700 hover:border-[var(--color-im-teal-300)]',
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          'flex size-3.5 items-center justify-center rounded-full border',
          checked
            ? 'border-[var(--color-im-teal-600)] bg-[var(--color-im-teal-600)]'
            : 'border-ink-300 bg-white',
        )}
      >
        {checked && <span className="size-1.5 rounded-full bg-white" />}
      </span>
      <span>{label}</span>
    </label>
  );
}

function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex justify-center gap-1.5">
      <span
        className={cn(
          'h-1.5 rounded-full transition-all',
          step === 1 ? 'w-8 bg-[var(--color-im-teal-500)]' : 'w-3 bg-[var(--color-im-teal-500)]',
        )}
      />
      <span
        className={cn(
          'h-1.5 rounded-full transition-all',
          step === 2 ? 'w-8 bg-[var(--color-im-teal-500)]' : 'w-3 bg-ink-200',
        )}
      />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*                                Subforms                                  */
/* ------------------------------------------------------------------------ */

function CityInput({
  id,
  label,
  value,
  onChange,
  popular,
  error,
  highlightedChip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  popular: string[];
  error?: string;
  highlightedChip?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-ink-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={cn(
            'block w-full rounded-md border bg-white px-3 py-2 pr-9 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-ink-200 focus:border-[var(--color-im-teal-400)] focus:ring-[var(--color-im-teal-200)]',
          )}
          placeholder="Enter city"
        />
        {value && (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <ClearIcon />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-semibold text-[var(--color-im-navy-700)]">Popular:</span>
        {popular.map((city) => {
          const isHighlighted =
            highlightedChip && highlightedChip.toLowerCase() === city.toLowerCase();
          return (
            <button
              key={city}
              type="button"
              onClick={() => onChange(city)}
              className={cn(
                'rounded-full border px-3 py-1 transition-colors',
                isHighlighted
                  ? 'border-[var(--color-im-teal-400)] bg-[var(--color-im-teal-50)] text-[var(--color-im-teal-800)]'
                  : 'border-ink-200 text-ink-700 hover:border-[var(--color-im-teal-300)] hover:text-[var(--color-im-teal-700)]',
              )}
            >
              {city}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TransporterResults({
  submission,
  transporters,
  onEdit,
}: {
  submission: Submission;
  transporters: Transporter[];
  onEdit: () => void;
}) {
  // Toast banner that fires when the user starts a chat with a transporter.
  const [chatWith, setChatWith] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Read-only shipment summary header */}
      <section className="rounded-md border border-ink-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="text-center">
          <h2 className="text-base font-semibold text-ink-900">Shipment Options</h2>
          <p className="mt-1 text-xs text-ink-500">
            Select a service provider and connect to share shipment details.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
          <ReadOnlyField label="Pickup City" value={submission.pickup} />
          <div className="flex justify-center pb-2 sm:pb-3">
            <Arrow />
          </div>
          <ReadOnlyField label="Drop City" value={submission.drop} />
          <Button
            type="button"
            variant="primary"
            onClick={onEdit}
            className="bg-[var(--color-im-navy-700)] hover:bg-[var(--color-im-navy-800)]"
          >
            Edit
          </Button>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-2 border-t border-ink-100 pt-4 text-xs sm:grid-cols-3">
          <MiniMeta label="Material weight" value={submission.weightLabel} />
          <MiniMeta label="Material type" value={submission.materialLabel} />
          <MiniMeta label="Truck type" value={submission.truckLabel} />
        </dl>
      </section>

      {/* Chat-started toast */}
      {chatWith && (
        <div
          role="status"
          className="flex items-center justify-between rounded-md border border-[var(--color-im-teal-200)] bg-[var(--color-im-teal-50)] px-4 py-2 text-xs text-[var(--color-im-teal-800)]"
        >
          <span>
            Chat opened with <strong>{chatWith}</strong>. Watch the Messages tab for replies.
          </span>
          <button
            type="button"
            onClick={() => setChatWith(null)}
            className="rounded p-1 hover:bg-[var(--color-im-teal-100)]"
            aria-label="Dismiss"
          >
            <ClearIcon />
          </button>
        </div>
      )}

      {/* Transporter list */}
      <ul className="space-y-3">
        {transporters.map((t) => (
          <TransporterCard key={t.id} transporter={t} onChat={() => setChatWith(t.name)} />
        ))}
      </ul>
    </div>
  );
}

function TransporterCard({
  transporter,
  onChat,
}: {
  transporter: Transporter;
  onChat: () => void;
}) {
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const formattedPrice = `₹${transporter.priceApprox.toLocaleString('en-IN')}/-`;

  return (
    <li>
      <article className="rounded-md border border-ink-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-[var(--shadow-card-hover)]">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          {/* Identity */}
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-md text-base font-bold',
                transporter.logoBg,
                transporter.logoFg,
              )}
            >
              {transporter.initials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-900">{transporter.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                <PinIcon />
                <span className="truncate">{transporter.address}</span>
              </p>
              {transporter.trustSealVerified && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--color-im-teal-700)]">
                  <SealIcon /> TrustSEAL Verified
                </p>
              )}
              <Stars rating={transporter.rating} reviewCount={transporter.reviewCount} />
            </div>
          </div>

          {/* Price */}
          <div className="text-left lg:text-right">
            <p className="text-base font-bold text-ink-900">{formattedPrice}</p>
            <p className="text-[11px] text-ink-500">approx.</p>
          </div>

          {/* CTAs */}
          <div className="flex w-full flex-col gap-2 lg:w-56">
            <button
              type="button"
              onClick={() => setPhoneRevealed(true)}
              disabled={phoneRevealed}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 rounded-md border px-3 py-2 text-xs font-semibold transition-colors',
                phoneRevealed
                  ? 'border-[var(--color-im-teal-200)] bg-white text-[var(--color-im-teal-800)]'
                  : 'border-[var(--color-im-teal-300)] bg-white text-[var(--color-im-teal-700)] hover:bg-[var(--color-im-teal-50)]',
              )}
            >
              <span className="flex items-center gap-1">
                <PhoneIcon />
                {phoneRevealed ? transporter.phone : 'View Mobile Number'}
              </span>
              <span className="text-[10px] font-normal text-ink-500">
                {transporter.responseRate}% Response Rate
              </span>
            </button>
            <button
              type="button"
              onClick={onChat}
              className="flex items-center justify-center gap-1.5 rounded-md bg-[var(--color-im-teal-600)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--color-im-teal-700)]"
            >
              <ChatBubbleIcon /> Chat Now
            </button>
          </div>
        </div>
      </article>
    </li>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-ink-700">{label}</p>
      <div className="mt-1 rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-900">
        {value}
      </div>
    </div>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink-900">{value}</dd>
    </div>
  );
}

function Stars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  // Render five stars; full / half / empty derived from the rating.
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-600">
      <span className="flex items-center gap-0.5" aria-label={`Rating ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const state: 'full' | 'half' | 'empty' = i < full ? 'full' : i === full && hasHalf ? 'half' : 'empty';
          return <StarIcon key={i} state={state} />;
        })}
      </span>
      <span className="font-semibold text-ink-800">{rating.toFixed(1)} / 5</span>
      <span className="text-ink-500">({reviewCount})</span>
    </p>
  );
}

/* ------------------------------------------------------------------------ */
/*                            Inline SVG icons                              */
/* ------------------------------------------------------------------------ */

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="7" width="11" height="9" rx="1" />
      <path d="M13 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-7 text-[var(--color-im-navy-600)]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8M13 8l4 4-4 4" />
    </svg>
  );
}

function BackArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5 text-ink-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5 shrink-0 text-ink-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function SealIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l2.4 2 3 .2.5 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.5 2.9-3 .2L12 22l-2.4-2-3-.2-.5-2.9L3.6 15l1-2.8-1-2.8 2.5-1.7.5-2.9 3-.2L12 2z" opacity="0.18" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function StarIcon({ state }: { state: 'full' | 'half' | 'empty' }) {
  // Use a linearGradient inside the icon to render the half-star fill.
  const gradientId = `star-half-${state}`;
  const fill =
    state === 'full'
      ? '#f59e0b'
      : state === 'half'
      ? `url(#${gradientId})`
      : '#e5e7eb';
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden>
      {state === 'half' && (
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2.5l3 6.1 6.7 1-4.9 4.7 1.2 6.7L12 17.8l-6 3.2 1.2-6.7L2.3 9.6l6.7-1z"
        fill={fill}
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.18 4.18 2 2 0 0 1 4.16 2h3a2 2 0 0 1 2 1.72c.13.96.34 1.9.63 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.29 1.85.5 2.81.63A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    </svg>
  );
}
