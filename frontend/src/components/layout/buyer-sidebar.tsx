'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: { text: string; tone: 'amber' | 'teal' | 'rose' };
}

export function BuyerSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const initial = (user?.name ?? 'U').charAt(0).toUpperCase();
  const displayName = user?.name ?? 'My account';

  const items: SidebarItem[] = [
    { label: 'Dashboard', href: '/me/dashboard', icon: <IconHome /> },
    { label: 'My Profile', href: '/me/profile', icon: <IconIdCard /> },
    { label: 'Messages', href: '/me/inquiries', icon: <IconMail /> },
    { label: 'Know Your Seller', href: '/me/know-your-seller', icon: <IconSearchUser /> },
    { label: 'Ship With IM', href: '/me/ship', icon: <IconTruck /> },
    { label: 'FAQ', href: '/me/faq', icon: <IconQuestion /> },
  ];

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 -mt-6 flex-col self-start overflow-y-auto rounded-xl border border-ink-200 bg-white shadow-sm lg:flex">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-[var(--color-im-navy-800)] to-[var(--color-im-navy-900)] p-4 rounded-t-xl">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-white/20 text-base font-bold text-white ring-2 ring-white/30 shadow-sm">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/60">
              <IconPin className="size-3" />
              <span>Add city</span>
              <button
                type="button"
                className="ml-1 text-yellow-300 hover:text-yellow-200 transition-colors"
                aria-label="Edit your city"
              >
                <IconPencil className="size-3" />
              </button>
            </p>
          </div>
        </div>
        {/* Quick stats */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/10 px-2 py-1.5 text-center">
            <p className="text-xs font-bold text-white">0</p>
            <p className="text-[10px] text-white/60">Inquiries</p>
          </div>
          <div className="rounded-lg bg-white/10 px-2 py-1.5 text-center">
            <p className="text-xs font-bold text-white">0</p>
            <p className="text-[10px] text-white/60">Requirements</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
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
                      ? 'bg-[var(--color-im-navy-50)] font-semibold text-[var(--color-im-navy-800)] shadow-sm'
                      : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'shrink-0 transition-colors',
                      active
                        ? 'text-[var(--color-im-navy-700)]'
                        : 'text-ink-400 group-hover:text-ink-600',
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {active && (
                    <span className="size-1.5 rounded-full bg-[var(--color-im-navy-600)]" aria-hidden />
                  )}
                  {item.badge && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        item.badge.tone === 'amber' && 'bg-amber-100 text-amber-700',
                        item.badge.tone === 'teal' && 'bg-[var(--color-im-teal-100)] text-[var(--color-im-teal-700)]',
                        item.badge.tone === 'rose' && 'bg-rose-100 text-rose-700',
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

      {/* Help footer */}
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

function IconIdCard() {
  return (
    <svg {...svgProps()}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2.5" />
      <path d="M5 17c.6-1.7 2.1-3 4-3s3.4 1.3 4 3" />
      <path d="M15 9h4M15 13h4" />
    </svg>
  );
}

function IconMail() {
  return <svg {...svgProps()}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
}

function IconSearchUser() {
  return (
    <svg {...svgProps()}>
      <circle cx="10" cy="9" r="3.5" />
      <path d="M5 19c.6-2.5 2.7-4.5 5-4.5s4.4 2 5 4.5" />
      <circle cx="17" cy="6" r="2.5" />
      <path d="M19 8l2 2" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg {...svgProps()}>
      <rect x="2" y="7" width="11" height="9" rx="1" />
      <path d="M13 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

function IconQuestion() {
  return (
    <svg {...svgProps()}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-.83.83-1.5 1.5-1.5 2.5" />
      <path d="M12 17h.01" />
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

function IconPin({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function IconPencil({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="M4 20l3.5-1L18 8.5 15.5 6 5 16.5z" />
      <path d="M14 7l3 3" />
    </svg>
  );
}
