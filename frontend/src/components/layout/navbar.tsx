'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';

import { MegaMenu } from '@/components/layout/mega-menu';
import { SearchBar } from '@/components/layout/search-bar';
import { Button } from '@/components/ui/button';
import { useInquiryCounts } from '@/features/inquiries/use-inquiry-counts';
import { useAuth } from '@/hooks/use-auth';
import { useAppDispatch } from '@/store';
import { openSellerSignup } from '@/store/slices/ui.slice';
import type { Role } from '@/types/api';

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { data: counts } = useInquiryCounts();
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useAppDispatch();

  const sellerCount = counts?.asSeller ?? 0;
  const buyerCount = counts?.asBuyer ?? 0;
  const totalCount = sellerCount + buyerCount;

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white shadow-sm">
      {/* Utility ribbon */}
      <div className="hidden border-b border-ink-100 bg-ink-50 text-[11px] text-ink-500 sm:block">
        <div className="mx-auto flex h-7 max-w-6xl items-center justify-end gap-4 px-4">
          <Link href="/requirements/new" className="hover:text-ink-900">
            Get best price
          </Link>
          <span className="text-ink-300">|</span>
          <button
            type="button"
            onClick={() => dispatch(openSellerSignup())}
            className="hover:text-ink-900"
          >
            Sell with us
          </button>
          <span className="text-ink-300">|</span>
          <a href="http://localhost:3001/api/docs" target="_blank" rel="noreferrer noopener" className="hover:text-ink-900">
            API
          </a>
          {!isAuthenticated && (
            <>
              <span className="text-ink-300">|</span>
              <Link href="/login" className="hover:text-ink-900">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-ink-900">
          indiamart-<span className="text-brand-600">clone</span>
        </Link>

        <div className="hidden md:block">
          <MegaMenu />
        </div>

        <div className="hidden flex-1 sm:block">
          {/* Suspense boundary required because SearchBar reads useSearchParams,
              which Next.js 15 enforces to be wrapped on prerender. */}
          <Suspense fallback={<div className="h-9 rounded-md border border-ink-200 bg-ink-50" />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav className="ml-auto flex items-center gap-2">
          {isLoading && !user ? (
            <span className="text-xs text-ink-400">Checking session…</span>
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="relative flex items-center gap-2 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm hover:bg-ink-50"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="relative inline-block">
                  <span className="size-6 rounded-full bg-brand-100 text-center text-xs font-semibold leading-6 text-brand-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {totalCount > 0 && (
                    <span
                      aria-label={`${totalCount} unread inquiries`}
                      className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-semibold text-white"
                    >
                      {totalCount > 9 ? '9+' : totalCount}
                    </span>
                  )}
                </span>
                <span className="hidden text-ink-700 sm:inline">{user.name.split(' ')[0]}</span>
                <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-500">
                  {user.role}
                </span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-ink-200 bg-white shadow-lg"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="border-b border-ink-100 px-3 py-2 text-xs">
                    <p className="font-medium text-ink-900">{user.name}</p>
                    <p className="truncate text-ink-500">{user.email}</p>
                  </div>

                  {user.role === 'admin' && (
                    <>
                      <Link
                        href="/admin/dashboard"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-brand-700 hover:bg-brand-50"
                      >
                        Admin panel
                      </Link>
                      <div className="border-t border-ink-100" />
                    </>
                  )}

                  {(['buyer', 'admin'] as Role[]).includes(user.role) && (
                    <>
                      <Link
                        href="/me/dashboard"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
                      >
                        My dashboard
                      </Link>
                      <Link
                        href="/me/inquiries"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
                      >
                        <span>My inquiries</span>
                        {buyerCount > 0 && (
                          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-medium text-white">
                            {buyerCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/me/saved"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
                      >
                        Saved products
                      </Link>
                      <Link
                        href="/me/requirements"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
                      >
                        My requirements
                      </Link>
                      <Link
                        href="/requirements/new"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
                      >
                        + Post a requirement
                      </Link>
                      <div className="border-t border-ink-100" />
                    </>
                  )}

                  {(['seller', 'admin'] as Role[]).includes(user.role) && (
                    <>
                      <Link
                        href="/seller/dashboard"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/seller/products"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
                      >
                        My products
                      </Link>
                      <Link
                        href="/seller/products/new"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
                      >
                        + New product
                      </Link>
                      <Link
                        href="/seller/inquiries"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
                      >
                        <span>Inquiries received</span>
                        {sellerCount > 0 && (
                          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-medium text-white">
                            {sellerCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/seller/leads"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
                      >
                        Buy leads
                      </Link>
                      <Link
                        href="/seller/profile"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
                      >
                        My profile
                      </Link>
                      <div className="border-t border-ink-100" />
                    </>
                  )}

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
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
