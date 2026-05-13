'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';

import { MegaMenu } from '@/components/layout/mega-menu';
import { SearchBar } from '@/components/layout/search-bar';
import { Button } from '@/components/ui/button';
import { useSellAction } from '@/features/auth/use-sell-action';
import { useInquiryCounts } from '@/features/inquiries/use-inquiry-counts';
import { useAuth } from '@/hooks/use-auth';
import { useLogout } from '@/hooks/use-logout';
import { cn } from '@/lib/utils';
import type { Role } from '@/types/api';

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const handleLogout = useLogout();
  const { data: counts } = useInquiryCounts();
  const [menuOpen, setMenuOpen] = useState(false);
  const onSellClick = useSellAction();

  const sellerCount = counts?.asSeller ?? 0;
  const buyerCount = counts?.asBuyer ?? 0;
  const totalCount = sellerCount + buyerCount;

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white shadow-sm">
      {/* Utility ribbon */}
      <div className="hidden border-b border-ink-100 bg-gradient-to-r from-brand-700 to-brand-600 text-[11px] text-white/90 sm:block">
        <div className="mx-auto flex h-7 max-w-[96rem] items-center justify-end gap-4 px-4">
          <Link href="/requirements/new" className="hover:text-white transition-colors">
            🏷️ Get best price
          </Link>
          <span className="text-white/30">|</span>
          <button
            type="button"
            onClick={onSellClick}
            className="hover:text-white transition-colors"
          >
            🏪 Sell with us
          </button>
          <span className="text-white/30">|</span>
          <a href="http://localhost:3001/api/docs" target="_blank" rel="noreferrer noopener" className="hover:text-white transition-colors">
            API Docs
          </a>
          {!isAuthenticated && (
            <>
              <span className="text-white/30">|</span>
              <Link href="/login" className="hover:text-white transition-colors font-medium">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex h-16 max-w-[96rem] items-center gap-3 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-sm font-extrabold text-white shadow-sm">
            iC
          </span>
          <span className="hidden text-lg font-bold tracking-tight text-ink-900 sm:inline">
            indiamart-<span className="text-brand-600">clone</span>
          </span>
        </Link>

        <div className="hidden md:block">
          <MegaMenu />
        </div>

        <div className="hidden flex-1 sm:block">
          <Suspense fallback={<div className="h-10 rounded-xl border border-ink-200 bg-ink-50 animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav className="ml-auto flex items-center gap-2">
          {isLoading && !user ? (
            <span className="h-8 w-20 rounded-lg bg-ink-100 animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className={cn(
                  'relative flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all duration-150',
                  menuOpen
                    ? 'border-brand-300 bg-brand-50 shadow-sm'
                    : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50 hover:shadow-sm',
                )}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="relative inline-flex">
                  <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {totalCount > 0 && (
                    <span
                      aria-label={`${totalCount} unread inquiries`}
                      className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white"
                    >
                      {totalCount > 9 ? '9+' : totalCount}
                    </span>
                  )}
                </span>
                <span className="hidden text-ink-700 font-medium sm:inline">{user.name.split(' ')[0]}</span>
                <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                  {user.role}
                </span>
                <svg viewBox="0 0 16 16" className={cn('size-3.5 text-ink-400 transition-transform duration-150', menuOpen && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-[var(--shadow-pop)] animate-fade-in"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  {/* User info header */}
                  <div className="bg-gradient-to-br from-brand-50 to-ink-50 border-b border-ink-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
                        <p className="truncate text-xs text-ink-500">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    {user.role === 'admin' && (
                      <>
                        <MenuLink href="/admin/dashboard" onClick={() => setMenuOpen(false)} icon="⚙️">
                          Admin panel
                        </MenuLink>
                        <div className="my-1 border-t border-ink-100" />
                      </>
                    )}

                    {(['buyer', 'admin'] as Role[]).includes(user.role) && (
                      <>
                        <MenuLink href="/me/dashboard" onClick={() => setMenuOpen(false)} icon="🏠">
                          My dashboard
                        </MenuLink>
                        <MenuLink href="/me/inquiries" onClick={() => setMenuOpen(false)} icon="💬" badge={buyerCount}>
                          My inquiries
                        </MenuLink>
                        <MenuLink href="/me/requirements" onClick={() => setMenuOpen(false)} icon="📋">
                          My requirements
                        </MenuLink>
                        <MenuLink href="/requirements/new" onClick={() => setMenuOpen(false)} icon="✨" highlight>
                          Post a requirement
                        </MenuLink>
                        <div className="my-1 border-t border-ink-100" />
                      </>
                    )}

                    {(['seller', 'admin'] as Role[]).includes(user.role) && (
                      <>
                        <MenuLink href="/seller/dashboard" onClick={() => setMenuOpen(false)} icon="📊">
                          Seller dashboard
                        </MenuLink>
                        <MenuLink href="/seller/products" onClick={() => setMenuOpen(false)} icon="📦">
                          My products
                        </MenuLink>
                        <MenuLink href="/seller/inquiries" onClick={() => setMenuOpen(false)} icon="📩" badge={sellerCount}>
                          Inquiries received
                        </MenuLink>
                        <MenuLink href="/seller/leads" onClick={() => setMenuOpen(false)} icon="🎯">
                          Buy leads
                        </MenuLink>
                        <MenuLink href="/me/profile" onClick={() => setMenuOpen(false)} icon="👤">
                          My profile
                        </MenuLink>
                        <div className="my-1 border-t border-ink-100" />
                      </>
                    )}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        void handleLogout();
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span aria-hidden>🚪</span>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="shadow-sm">
                  Sign up free
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*                         Menu link helper                            */
/* ------------------------------------------------------------------ */

function MenuLink({
  href,
  onClick,
  icon,
  badge,
  highlight,
  children,
}: {
  href: string;
  onClick: () => void;
  icon?: string;
  badge?: number;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 px-4 py-2 text-sm transition-colors',
        highlight
          ? 'font-semibold text-brand-700 hover:bg-brand-50'
          : 'text-ink-700 hover:bg-ink-50',
      )}
    >
      {icon && <span aria-hidden className="text-base leading-none">{icon}</span>}
      <span className="flex-1">{children}</span>
      {badge != null && badge > 0 && (
        <span className="flex size-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}
