'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  /** Optional small badge (e.g. profile completion %). */
  badge?: { text: string; tone: 'amber' | 'teal' | 'rose' };
}

/**
 * Left rail used inside the buyer area only. Hidden below `lg:` for v1; the
 * dashboard content stacks on smaller screens.
 */
export function BuyerSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const initial = (user?.name ?? 'U').charAt(0).toUpperCase();
  const displayName = user?.name ?? 'My account';
  const completion = computeProfileCompletion(user);

  const items: SidebarItem[] = [
    { label: 'Dashboard', href: '/me/dashboard', icon: <IconHome /> },
    {
      label: 'My Profile',
      href: '/me/profile',
      icon: <IconIdCard />,
      badge: { text: `${completion}%`, tone: 'amber' },
    },
    { label: 'Messages', href: '/me/inquiries', icon: <IconMail /> },
    { label: 'TrustSEAL Buyer', href: '#', icon: <IconShieldCheck /> },
    { label: 'Know Your Seller', href: '#', icon: <IconSearchUser /> },
    { label: 'Payment Protection', href: '#', icon: <IconShieldDollar /> },
    { label: 'Loans', href: '#', icon: <IconWallet /> },
    { label: 'Ship With IM', href: '#', icon: <IconTruck /> },
    { label: 'Credit Score', href: '#', icon: <IconChart /> },
  ];

  return (
    <aside className="hidden w-60 shrink-0 flex-col self-start rounded-md border border-ink-200 bg-white shadow-sm lg:flex">
      {/* Profile header */}
      <div className="border-b border-ink-200 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-[var(--color-im-navy-700)] text-base font-semibold text-white">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{displayName}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
              <IconPin className="size-3" />
              <span>Add city</span>
              <button
                type="button"
                className="ml-1 text-[var(--color-im-teal-700)] hover:underline"
                aria-label="Edit your city"
              >
                <IconPencil className="size-3" />
              </button>
            </p>
          </div>
        </div>
        <Link
          href="#"
          className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-700 hover:underline"
        >
          <span aria-hidden className="text-amber-600">★</span>
          Become TrustSEAL Buyer
        </Link>
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
                      active ? 'text-[var(--color-im-navy-700)]' : 'text-ink-500 group-hover:text-ink-700',
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
/*                          Profile completion                              */
/* ------------------------------------------------------------------------ */

function computeProfileCompletion(
  user:
    | {
        name: string;
        email: string;
        phone: string | null;
        isVerified: boolean;
      }
    | null,
): number {
  if (!user) return 0;
  // Simple heuristic over the fields we currently expose.
  const checks = [
    Boolean(user.name?.trim()),
    Boolean(user.email?.trim()),
    Boolean(user.phone?.trim()),
    user.isVerified,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
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
  return (
    <svg {...svgProps()}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function IconShieldCheck() {
  return (
    <svg {...svgProps()}>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
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

function IconShieldDollar() {
  return (
    <svg {...svgProps()}>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6z" />
      <path d="M14 9.5c-.5-.6-1.3-1-2.2-1-1.5 0-2.5.8-2.5 1.8 0 1.1 1 1.5 2.5 1.9 1.5.4 2.5.8 2.5 1.9s-1 1.8-2.5 1.8c-1 0-1.8-.4-2.3-1" />
      <path d="M11.8 7v1.5M11.8 15.5V17" />
    </svg>
  );
}

function IconWallet() {
  return (
    <svg {...svgProps()}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="17" cy="14.5" r="1.2" />
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

function IconChart() {
  return (
    <svg {...svgProps()}>
      <path d="M4 19h16" />
      <path d="M7 16V9" />
      <path d="M11 16V5" />
      <path d="M15 16v-8" />
      <path d="M19 16v-4" />
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
