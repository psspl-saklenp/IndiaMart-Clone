'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

export function SellerSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const initial = (user?.name ?? 'S').charAt(0).toUpperCase();
  const displayName = user?.name ?? 'My business';

  const items: SidebarItem[] = [
    { label: 'Dashboard', href: '/seller/dashboard', icon: <IconHome />, description: 'Overview & stats' },
    { label: 'Products', href: '/seller/products', icon: <IconBox />, description: 'Manage catalog' },
    { label: 'Inquiries', href: '/seller/inquiries', icon: <IconMail />, description: 'Buyer messages' },
    { label: 'Buy leads', href: '/seller/leads', icon: <IconLead />, description: 'RFQ marketplace' },
  ];

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 -mt-8 flex-col self-start overflow-y-auto rounded-xl border border-ink-200 bg-white shadow-sm lg:flex">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-800 p-4 rounded-t-xl">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-white/20 text-base font-bold text-white ring-2 ring-white/30 shadow-sm">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-yellow-300/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-300">
              <span aria-hidden>✓</span> Seller
            </span>
          </div>
        </div>
        {/* Quick actions */}
        <div className="mt-3">
          <Link
            href="/seller/products/new"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25 transition-all duration-150"
          >
            <span aria-hidden>+</span>
            Add new product
          </Link>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        <p className="mb-1 px-4 text-[10px] font-bold uppercase tracking-widest text-ink-400">
          Navigation
        </p>
        <ul className="space-y-0.5 px-2">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '#' && pathname.startsWith(item.href + '/'));
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150',
                    active
                      ? 'bg-brand-50 font-semibold text-brand-800 shadow-sm'
                      : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'shrink-0 transition-colors',
                      active ? 'text-brand-700' : 'text-ink-400 group-hover:text-ink-600',
                    )}
                  >
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate">{item.label}</span>
                    {item.description && (
                      <span className={cn('block truncate text-[11px]', active ? 'text-brand-600' : 'text-ink-400')}>
                        {item.description}
                      </span>
                    )}
                  </div>
                  {active && (
                    <span className="size-1.5 rounded-full bg-brand-600 shrink-0" aria-hidden />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Quick links section */}
        <div className="mt-4 px-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-400">
            Quick actions
          </p>
          <div className="space-y-1">
            <Link
              href="/me/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-600 hover:bg-ink-50 hover:text-ink-900 transition-colors"
            >
              <span aria-hidden>👤</span>
              My profile
            </Link>
            <Link
              href="/me/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-600 hover:bg-ink-50 hover:text-ink-900 transition-colors"
            >
              <span aria-hidden>🛒</span>
              Switch to buyer
            </Link>
          </div>
        </div>
      </nav>

      <div className="border-t border-ink-100 px-4 py-3">
        <Link
          href="#"
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-800 transition-colors"
        >
          <IconHelpCircle className="size-4 text-ink-400" />
          Help and support
        </Link>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*                          Inline SVG icons                           */
/* ------------------------------------------------------------------ */

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
  return <svg {...svgProps()}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>;
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
  return <svg {...svgProps()}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
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
