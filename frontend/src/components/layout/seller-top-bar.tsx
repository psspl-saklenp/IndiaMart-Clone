'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useInquiryCounts } from '@/features/inquiries/use-inquiry-counts';
import { useAuth } from '@/hooks/use-auth';

/**
 * Minimal top bar for the seller area.
 *
 * Intentionally LIGHTER than the buyer/public navbar: there is no global
 * search box, no "All categories" mega menu, and no buyer-flow links. The
 * seller experience is meant to be focused on product creation and the
 * inquiries that come back from buyers — discovering products, applying
 * filters and sending inquiries lives entirely on the buyer side.
 */
export function SellerTopBar() {
  const { user, logout } = useAuth();
  const { data: counts } = useInquiryCounts();
  const [menuOpen, setMenuOpen] = useState(false);

  const sellerCount = counts?.asSeller ?? 0;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/seller/dashboard"
          className="text-lg font-bold tracking-tight text-ink-900"
        >
          indiamart-<span className="text-brand-600">clone</span>
          <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
            Seller
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-2">
          <Link
            href="/seller/inquiries"
            className="relative hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50 sm:inline-flex"
          >
            <IconChat />
            <span>Inquiries</span>
            {sellerCount > 0 && (
              <span
                aria-label={`${sellerCount} new inquiries`}
                className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white"
              >
                {sellerCount > 9 ? '9+' : sellerCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm hover:bg-ink-50"
              >
                <span className="size-6 rounded-full bg-brand-100 text-center text-xs font-semibold leading-6 text-brand-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-ink-700 sm:inline">{firstName}</span>
                <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-500">
                  {user.role}
                </span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  onMouseLeave={() => setMenuOpen(false)}
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-ink-200 bg-white shadow-lg"
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
                  <DropdownItem href="/seller/products/new" onClose={() => setMenuOpen(false)}>
                    + New product
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
                      void logout();
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </nav>
      </div>
    </header>
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

function IconChat() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
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
