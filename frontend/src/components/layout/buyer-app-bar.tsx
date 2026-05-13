'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';

import { SearchBar } from '@/components/layout/search-bar';
import { useSellAction } from '@/features/auth/use-sell-action';
import { useAuth } from '@/hooks/use-auth';
import { useLogout } from '@/hooks/use-logout';
import { cn } from '@/lib/utils';

export function BuyerAppBar() {
  const { user } = useAuth();
  const handleLogout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleSellClick = useSellAction();

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <header className="sticky top-0 z-30 w-full shadow-md" style={{ background: 'linear-gradient(135deg, #312e81 0%, #3730a3 60%, #1d8488 100%)' }}>
      <div className="mx-auto flex h-14 max-w-[96rem] items-center gap-4 px-4">
        {/* Wordmark */}
        <Link href="/me/dashboard" className="flex items-center gap-2 shrink-0">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-xl bg-white text-sm font-extrabold tracking-tight text-[var(--color-im-navy-800)] shadow-sm"
          >
            iC
          </span>
          <span className="hidden text-base font-bold tracking-tight text-white sm:inline">
            indiamart-<span className="text-yellow-300">clone</span>
          </span>
        </Link>

        {/* Search bar */}
        <div className="hidden min-w-0 flex-1 max-w-xl md:block">
          <Suspense
            fallback={
              <div className="h-9 rounded-xl border border-white/20 bg-white/10 animate-pulse" />
            }
          >
            <SearchBar />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <UtilityButton onClick={handleSellClick} icon={<IconStorefront />} label="Sell" />
          <UtilityLink href="/me/inquiries" icon={<IconChat />} label="Messages" />
          <UtilityLink href="#" icon={<IconHelp />} label="Help" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-white/95 transition-all duration-150',
                menuOpen ? 'bg-white/20' : 'hover:bg-white/10',
              )}
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white ring-2 ring-white/30">
                {(user?.name ?? 'U').charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline">Hi {firstName}</span>
              <IconChevronDown className={cn('hidden sm:inline-block transition-transform duration-150', menuOpen && 'rotate-180')} />
            </button>

            {menuOpen && (
              <div
                role="menu"
                onMouseLeave={() => setMenuOpen(false)}
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-ink-200 bg-white text-ink-800 shadow-[var(--shadow-pop)] animate-fade-in"
              >
                <div className="bg-gradient-to-br from-[var(--color-im-navy-50)] to-white border-b border-ink-100 px-4 py-3">
                  <p className="font-semibold text-ink-900 text-sm">{user?.name}</p>
                  <p className="truncate text-xs text-ink-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <DropdownItem href="/me/dashboard" onClose={() => setMenuOpen(false)} icon="🏠">
                    My dashboard
                  </DropdownItem>
                  <DropdownItem href="/me/inquiries" onClose={() => setMenuOpen(false)} icon="💬">
                    My inquiries
                  </DropdownItem>
                  <DropdownItem href="/me/requirements" onClose={() => setMenuOpen(false)} icon="📋">
                    My requirements
                  </DropdownItem>
                  <DropdownItem href="/me/profile" onClose={() => setMenuOpen(false)} icon="👤">
                    My profile
                  </DropdownItem>
                  <div className="my-1 border-t border-ink-100" />
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
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*                           Subcomponents                             */
/* ------------------------------------------------------------------ */

function UtilityLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="hidden flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-white/10 transition-all duration-150 sm:flex"
    >
      <span aria-hidden className="text-white/80">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function UtilityButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-white/10 transition-all duration-150 sm:flex"
    >
      <span aria-hidden className="text-white/80">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function DropdownItem({
  href,
  onClose,
  icon,
  children,
}: {
  href: string;
  onClose: () => void;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClose}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
    >
      {icon && <span aria-hidden className="text-base leading-none">{icon}</span>}
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*                          Inline SVG icons                           */
/* ------------------------------------------------------------------ */

function IconStorefront() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9l1.5-4.5h15L21 9" />
      <path d="M4 9v11h16V9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconHelp() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-.83.83-1.5 1.5-1.5 2.5" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-4', className)} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
