'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useInquiryCounts } from '@/features/inquiries/use-inquiry-counts';
import { useAuth } from '@/hooks/use-auth';
import { useLogout } from '@/hooks/use-logout';
import { cn } from '@/lib/utils';

/**
 * Top bar for the seller area.
 *
 * Uses the same navy palette as the buyer app bar so the authenticated shell
 * feels coherent across roles, but surfaces seller-specific quick actions:
 * an inquiries link with an unread badge, a help shortcut, and the profile
 * dropdown.
 */
export function SellerTopBar() {
  const { user } = useAuth();
  const handleLogout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: counts } = useInquiryCounts();
  const sellerCount = counts?.asSeller ?? 0;

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--color-im-navy-800)] text-white shadow-md">
      <div className="mx-auto flex h-14 max-w-[96rem] items-center gap-4 px-4">
        {/* Wordmark + seller pill */}
        <Link
          href="/seller/dashboard"
          className="flex items-center gap-2"
        >
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-md bg-white text-base font-extrabold tracking-tight text-[var(--color-im-navy-800)]"
          >
            iC
          </span>
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">
            indiamart-<span className="text-amber-300">clone</span>
          </span>
          <span className="ml-1 rounded bg-amber-300/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-im-navy-900)]">
            Seller
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <UtilityLink
            href="/seller/inquiries"
            icon={<IconChat />}
            label="Inquiries"
            badge={sellerCount > 0 ? (sellerCount > 9 ? '9+' : String(sellerCount)) : undefined}
          />
          <UtilityLink href="#" icon={<IconHelp />} label="Help" />

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white/95 hover:bg-white/10"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">Hi {firstName}</span>
                <IconChevronDown className="hidden sm:inline-block" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  onMouseLeave={() => setMenuOpen(false)}
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-ink-200 bg-white text-ink-800 shadow-[var(--shadow-pop)]"
                >
                  <div className="border-b border-ink-100 px-3 py-2 text-xs">
                    <p className="font-medium text-ink-900">{user.name}</p>
                    <p className="truncate text-ink-500">{user.email}</p>
                  </div>
                  <DropdownItem href="/seller/dashboard" onClose={() => setMenuOpen(false)}>
                    Dashboard
                  </DropdownItem>
                  <DropdownItem href="/seller/products" onClose={() => setMenuOpen(false)}>
                    My products
                  </DropdownItem>
                  {/* Sellers also have business details — companyName, GST,
                      etc. — captured at signup. Sending "My profile" to the
                      unified buyer profile page lets them edit those details
                      in the same UI as buyers (the page reads them from the
                      auth payload regardless of role). */}
                  <DropdownItem href="/me/profile" onClose={() => setMenuOpen(false)}>
                    My profile
                  </DropdownItem>
                  <div className="border-t border-ink-100" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      void handleLogout();
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------------ */
/*                              Subcomponents                               */
/* ------------------------------------------------------------------------ */

function UtilityLink({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="relative hidden flex-col items-center justify-center gap-0.5 rounded-md px-3 py-1 text-[11px] font-medium text-white/90 hover:bg-white/10 sm:flex"
    >
      <span aria-hidden className="relative">
        {icon}
        {badge && (
          <span
            aria-label={`${badge} unread`}
            className="absolute -right-2 -top-1 flex size-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-semibold text-[var(--color-im-navy-900)]"
          >
            {badge}
          </span>
        )}
      </span>
      <span>{label}</span>
    </Link>
  );
}

function DropdownItem({
  href,
  onClose,
  children,
}: {
  href: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClose}
      className="block px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------------ */
/*                            Inline SVG icons                              */
/* ------------------------------------------------------------------------ */

function IconChat() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconHelp() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-.83.83-1.5 1.5-1.5 2.5" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-4', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
