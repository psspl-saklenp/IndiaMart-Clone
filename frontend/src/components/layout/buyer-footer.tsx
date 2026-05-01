import Link from 'next/link';

import { SellerSignupTrigger } from '@/features/auth/seller-signup-trigger';

const CURRENT_YEAR = new Date().getFullYear();

type FooterLinkItem =
  | { kind?: 'link'; label: string; href: string }
  | { kind: 'sellerSignup'; label: string };

interface FooterColumn {
  title?: string;
  links: FooterLinkItem[];
}

const COLUMNS: FooterColumn[] = [
  {
    links: [
      { label: 'Home', href: '/' },
      { label: 'About Us', href: '#' },
      { label: 'Exports', href: '#' },
      { label: 'Terms of Use', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Shipping & Delivery Policy', href: '#' },
      { label: 'Returns & Cancellation Policy', href: '#' },
      { label: 'Help', href: '#' },
    ],
  },
  {
    links: [
      { label: 'Customer Care', href: '#' },
      { label: 'Contact Us', href: '#' },
      { label: 'Success Stories', href: '#' },
      { label: 'Press Section', href: '#' },
      { label: 'Jobs & Careers', href: '#' },
      { label: 'Desktop Site', href: '#' },
    ],
  },
  {
    title: 'Suppliers Tool Kit',
    links: [
      { kind: 'sellerSignup', label: 'Sell on our marketplace' },
      { label: 'Latest BuyLeads', href: '/seller/leads' },
      { label: 'Learning Centre', href: '#' },
      { label: 'Ship With Us', href: '#' },
    ],
  },
  {
    title: 'Buyers Tool Kit',
    links: [
      { label: 'Post Your Requirement', href: '/requirements/new' },
      { label: 'Search Product or Service', href: '/search' },
    ],
  },
  {
    title: 'Accounting Solutions',
    links: [
      { label: 'Accounting Software', href: '#' },
      { label: 'Mobile Accounting', href: '#' },
      { label: 'GST e-invoice', href: '#' },
    ],
  },
];

export function BuyerFooter() {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((col, idx) => (
            <FooterColumnView key={col.title ?? idx} column={col} />
          ))}
        </div>
      </div>

      <div className="border-t border-ink-100 bg-ink-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 text-xs text-ink-500 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <SocialIcon name="facebook" />
            <SocialIcon name="x" />
            <SocialIcon name="linkedin" />
          </div>
          <p>
            &copy; {CURRENT_YEAR} indiamart-clone &middot; Educational replica, not affiliated with IndiaMART.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumnView({ column }: { column: FooterColumn }) {
  return (
    <div>
      {column.title && (
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-700">
          {column.title}
        </h3>
      )}
      <ul className={column.title ? 'mt-3 space-y-1.5 text-sm' : 'space-y-1.5 text-sm'}>
        {column.links.map((link) => (
          <li key={link.label}>
            {link.kind === 'sellerSignup' ? (
              <SellerSignupTrigger className="text-ink-600 hover:text-ink-900">
                {link.label}
              </SellerSignupTrigger>
            ) : (
              <Link href={link.href} className="text-ink-600 hover:text-ink-900">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*                       Generic outline social icons                       */
/*  Original outline shapes, NOT reproductions of any branded icon set.     */
/* ------------------------------------------------------------------------ */

function SocialIcon({ name }: { name: 'facebook' | 'x' | 'linkedin' }) {
  // Render a generic, monochrome glyph for each platform name. We deliberately
  // avoid the official logo SVGs.
  const label =
    name === 'facebook' ? 'Social link' : name === 'x' ? 'Social link' : 'Social link';
  return (
    <a
      href="#"
      aria-label={label}
      className="inline-flex size-8 items-center justify-center rounded-full border border-ink-300 text-ink-500 transition-colors hover:border-[var(--color-im-navy-700)] hover:text-[var(--color-im-navy-700)]"
    >
      {name === 'facebook' && <FacebookGlyph />}
      {name === 'x' && <XGlyph />}
      {name === 'linkedin' && <LinkedInGlyph />}
    </a>
  );
}

function FacebookGlyph() {
  // Generic "F" mark in a square.
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M14 8h-1.5c-.8 0-1.5.7-1.5 1.5V12h-2v2h2v6h2v-6h2l.5-2H13v-1.5c0-.3.2-.5.5-.5H14V8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XGlyph() {
  // Generic "X" mark in a square.
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8l8 8M16 8l-8 8" />
    </svg>
  );
}

function LinkedInGlyph() {
  // Generic "in" mark in a square.
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1" fill="currentColor" stroke="none" />
      <path d="M8 11v6" />
      <path d="M11.5 17v-3.5a2 2 0 0 1 4 0V17M11.5 11.5V17" />
    </svg>
  );
}
