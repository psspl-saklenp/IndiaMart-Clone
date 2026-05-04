'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useInquiryCounts } from '@/features/inquiries/use-inquiry-counts';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  /** Optional small badge (e.g. unread count). */
  badge?: { text: string; tone: 'amber' | 'teal' | 'rose' | 'brand' };
}

/**
 * Left rail used inside the seller area only. Mirrors the buyer sidebar in
 * shape and behaviour (sticky, full-height, flush with the top bar) but
 * surfaces the seller-specific routes.
 */
export function SellerSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { data: counts } = useInquiryCounts();
  const sellerCount = counts?.asSeller ?? 0;

  const initial = (user?.name ?? 'S').charAt(0).toUpperCase();
  const displayName = user?.name ?? 'My business';

  const items: SidebarItem[] = [
    { label: 'Dashboard', href: '/seller/dashboard', icon: <IconHome /> },
    { label: 'Products', href: '/seller/products', icon: <IconBox /> },
    {
      label: 'Inquiries',
      href: '/seller/inquiries',
      icon: <IconMail />,
      badge:
        sellerCount > 0
          ? { text: sellerCount > 9 ? '9+' : String(sellerCount), tone: 'brand' }
          : undefined,
    },
    { label: 'Buy leads', href: '/seller/leads', icon: <IconLead /> },
  ];

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 -mt-8 flex-col self-start overflow-y-auto rounded-b-md border-x border-b border-ink-200 bg-white shadow-sm lg:flex">
      {/* Profile header */}
      <div className="border-b border-ink-200 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-[var(--color-im-navy-700)] text-base font-semibold text-white">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{displayName}</p>
            <p className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
              Seller
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '#' && pathname.startsWith(item.href + '/'));
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                    active
                      ? 'border-l-4 border-[var(--color-im-navy-700)] bg-[var(--color-im-navy-50)] pl-3 font-semibold text-[var(--color-im-navy-800)]'
                      : 'border-l-4 border-transparent text-ink-700 hover:bg-ink-50',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'shrink-0',
                      active
                        ? 'text-[var(--color-im-navy-700)]'
                        : 'text-ink-500 group-hover:text-ink-700',
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        item.badge.tone === 'amber' && 'bg-amber-100 text-amber-700',
                        item.badge.tone === 'teal' &&
                          'bg-[var(--color-im-teal-100)] text-[var(--color-im-teal-700)]',
                        item.badge.tone === 'rose' && 'bg-rose-100 text-rose-700',
                        item.badge.tone === 'brand' && 'bg-brand-600 text-white',
                      )}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-ink-200 px-4 py-3">
        <Link
          href="#"
          className="flex items-center gap-2 text-xs font-medium text-ink-500 hover:text-ink-800"
        >
          <IconHelpCircle className="size-4" />
          Help and support
        </Link>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------------ */
/*                            Inline SVG icons                              */
/* ------------------------------------------------------------------------ */

const ICON_BASE = 'size-5';

function svgProps(extraClass?: string) {
  return {
    viewBox: '0 0 24 24',
    className: cn(ICON_BASE, extraClass),
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
}

function IconHome() {
  return (
    <svg {...svgProps()}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg {...svgProps()}>
      <path d="M21 8L12 3 3 8v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg {...svgProps()}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function IconLead() {
  return (
    <svg {...svgProps()}>
      <path d="M3 17l5-5 4 4 8-8" />
      <path d="M14 8h6v6" />
    </svg>
  );
}

function IconHelpCircle({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-.83.83-1.5 1.5-1.5 2.5" />
      <path d="M12 17h.01" />
    </svg>
  );
}
