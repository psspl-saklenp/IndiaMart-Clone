/**
 * Static curated content for the buyer dashboard.
 *
 * Everything in this module is original/placeholder data:
 *   - No real third-party brand names, logos, or trademarks.
 *   - No real testimonial quotes, photos, or YouTube embeds.
 *
 * Swap any of these arrays for a CMS-backed source later.
 */

export type ActivityTone = 'sky' | 'emerald' | 'rose' | 'amber';

export interface ActivityTileMeta {
  /** Stable key used to render the icon. */
  icon: 'inquiry' | 'lead' | 'reply' | 'call';
  label: string;
  tone: ActivityTone;
}

/**
 * Order matches the four-up grid in the reference design.
 * Values are wired in by the dashboard component from real APIs (see buyer-dashboard.tsx).
 */
export const ACTIVITY_TILES: ActivityTileMeta[] = [
  { icon: 'inquiry', label: 'Enquiry Posted', tone: 'sky' },
  { icon: 'lead', label: 'BuyLead Posted', tone: 'emerald' },
  { icon: 'reply', label: 'Replies', tone: 'rose' },
  { icon: 'call', label: 'Calls', tone: 'amber' },
];

/**
 * Tile-specific colour pairs. Mirror the pastel chips in the reference design
 * but keep all colour values driven by our own theme tokens.
 */
export const TILE_TONE_CLASS: Record<
  ActivityTone,
  { bg: string; iconBg: string; iconFg: string }
> = {
  sky: {
    bg: 'bg-[var(--color-im-tile-sky-bg)]',
    iconBg: 'bg-[var(--color-im-tile-sky-bg)]',
    iconFg: 'text-[var(--color-im-tile-sky-fg)]',
  },
  emerald: {
    bg: 'bg-[var(--color-im-tile-emerald-bg)]',
    iconBg: 'bg-[var(--color-im-tile-emerald-bg)]',
    iconFg: 'text-[var(--color-im-tile-emerald-fg)]',
  },
  rose: {
    bg: 'bg-[var(--color-im-tile-rose-bg)]',
    iconBg: 'bg-[var(--color-im-tile-rose-bg)]',
    iconFg: 'text-[var(--color-im-tile-rose-fg)]',
  },
  amber: {
    bg: 'bg-[var(--color-im-tile-amber-bg)]',
    iconBg: 'bg-[var(--color-im-tile-amber-bg)]',
    iconFg: 'text-[var(--color-im-tile-amber-fg)]',
  },
};

/* -------------------------------------------------------------------------
   Top brands strip
   ----------------------------------------------------------------------- */

/**
 * Fictional placeholder "brands" rendered as styled text marks. These names are
 * intentionally generic so we don't reference any real company.
 */
export interface PlaceholderBrand {
  name: string;
  /** Optional second line so each tile can have a tiny tagline. */
  tagline: string;
  /** Tailwind text-color class used for the wordmark. */
  colorClass: string;
}

export const PLACEHOLDER_BRANDS: PlaceholderBrand[] = [
  { name: 'NorthPeak', tagline: 'Industrial group', colorClass: 'text-yellow-700' },
  { name: 'Verdant Co.', tagline: 'Appliances', colorClass: 'text-emerald-700' },
  { name: 'Crimson Forge', tagline: 'Engineering', colorClass: 'text-rose-700' },
  { name: 'Blueline Tech', tagline: 'Automation', colorClass: 'text-sky-700' },
  { name: 'Saffron Mobility', tagline: 'Transport', colorClass: 'text-violet-700' },
];

/* -------------------------------------------------------------------------
   "More For You" promo tiles
   ----------------------------------------------------------------------- */

export interface PromoTile {
  /** Stable key used to render the icon. */
  icon: 'verified' | 'sell' | 'app' | 'mobile';
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  toneClass: string;
}

/**
 * Original copy. Wording is paraphrased so we are not reusing IndiaMART's text.
 */
export const PROMO_TILES: PromoTile[] = [
  {
    icon: 'verified',
    title: 'Get verified sellers',
    description:
      'Tell us what you need and our team will match you with vetted suppliers.',
    ctaLabel: 'Find verified sellers',
    ctaHref: '/requirements/new',
    toneClass: 'bg-rose-50',
  },
  {
    icon: 'sell',
    title: 'Sell on our marketplace',
    description:
      'Reach lakhs of buyers across India. Listing your products is free.',
    ctaLabel: 'Start selling',
    ctaHref: '/register?role=seller',
    toneClass: 'bg-emerald-50',
  },
  {
    icon: 'app',
    title: 'Download our app',
    description:
      'Get instant inquiry alerts on your phone. Available on Android and iOS.',
    ctaLabel: 'Download now',
    ctaHref: '#',
    toneClass: 'bg-sky-50',
  },
  {
    icon: 'mobile',
    title: 'Mobile accounting',
    description:
      'Sync ledgers and view live ageing reports from any device, anywhere.',
    ctaLabel: 'Learn more',
    ctaHref: '#',
    toneClass: 'bg-violet-50',
  },
];

/* -------------------------------------------------------------------------
   Testimonials
   ----------------------------------------------------------------------- */

export interface Testimonial {
  /** Anonymised first name + role label, no real person. */
  name: string;
  role: string;
  /** Short, original quote written for this clone (not lifted from any source). */
  quote: string;
  /** Solid colour for the placeholder thumbnail (no real photo / no YouTube). */
  thumbColorClass: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Aarav S.',
    role: 'Electronics wholesaler',
    quote:
      'Sourcing electrical components used to take days. Now I shortlist three suppliers in an afternoon and place a trial order the same week.',
    thumbColorClass: 'bg-gradient-to-br from-yellow-200 to-rose-200',
  },
  {
    name: 'Meera P.',
    role: 'Construction contractor',
    quote:
      'Posting a single requirement got me five competitive quotes for steel rods within hours. The negotiation tools save real time.',
    thumbColorClass: 'bg-gradient-to-br from-emerald-200 to-sky-200',
  },
  {
    name: 'Rohit K.',
    role: 'Disposable goods buyer',
    quote:
      'For bulk orders the price discovery is the biggest win. I have a trusted shortlist for every category I source from now.',
    thumbColorClass: 'bg-gradient-to-br from-sky-200 to-indigo-200',
  },
  {
    name: 'Priya N.',
    role: 'Garment manufacturer',
    quote:
      'I was sceptical about online B2B but the verified-supplier badge gave me the confidence to scale my procurement.',
    thumbColorClass: 'bg-gradient-to-br from-rose-200 to-pink-200',
  },
];

