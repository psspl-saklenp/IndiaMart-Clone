'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="text-base font-bold tracking-tight text-ink-900">
          indiamart-<span className="text-brand-600">clone</span>
        </Link>

        {/* Search placeholder; the real search lands in Phase 5 */}
        <div className="hidden flex-1 sm:block">
          <div className="flex items-center rounded-md border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs text-ink-400">
            Search products, suppliers, categories…
            <span className="ml-auto rounded bg-white px-1.5 text-[10px] uppercase text-ink-400">
              Phase 5
            </span>
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-2">
          {isLoading && !user ? (
            <span className="text-xs text-ink-400">Checking session…</span>
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm hover:bg-ink-50"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="size-6 rounded-full bg-brand-100 text-center text-xs font-semibold leading-6 text-brand-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-ink-700 sm:inline">{user.name.split(' ')[0]}</span>
                <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-500">
                  {user.role}
                </span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border border-ink-200 bg-white shadow-lg"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="border-b border-ink-100 px-3 py-2 text-xs">
                    <p className="font-medium text-ink-900">{user.name}</p>
                    <p className="truncate text-ink-500">{user.email}</p>
                  </div>
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
