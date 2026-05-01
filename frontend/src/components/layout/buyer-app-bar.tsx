'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store';
import { openSellerSignup } from '@/store/slices/ui.slice';

/**
 * Top app bar used inside the buyer area only.
 *
 * Visually inspired by the reference design but uses ONLY the project's own
 * branding (`indiamart-clone` wordmark + a stylised letter-mark). No third-party
 * logos or trademarks are reproduced here.
 */
export function BuyerAppBar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  // Buyers/admins land here. Buyers can't access /seller/dashboard, so they
  // get the seller signup modal; admins (who already have seller access) go
  // straight to the dashboard.
  const isAlreadySeller = user?.role === 'seller' || user?.role === 'admin';
  function handleSellClick() {
    if (isAlreadySeller) {
      router.push('/seller/dashboard');
    } else {
      dispatch(openSellerSignup());
    }
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--color-im-navy-800)] text-white shadow-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        {/* Wordmark */}
        <Link href="/me/dashboard" className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-md bg-white text-base font-extrabold tracking-tight text-[var(--color-im-navy-800)]"
          >
            iC
          </span>
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">
            indiamart-<span className="text-amber-300">clone</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <UtilityButton onClick={handleSellClick} icon={<IconStorefront />} label="Sell" />
          <UtilityLink href="/me/inquiries" icon={<IconChat />} label="Messages" />
          <UtilityLink href="#" icon={<IconHelp />} label="Help" />
          <UtilityLink href="#" icon={<IconGlobe />} label="Exporters" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white/95 hover:bg-white/10"
            >
              <IconUser />
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
                  <p className="font-medium text-ink-900">{user?.name}</p>
                  <p className="truncate text-ink-500">{user?.email}</p>
                </div>
                <DropdownItem href="/me/dashboard" onClose={() => setMenuOpen(false)}>
                  My dashboard
                </DropdownItem>
                <DropdownItem href="/me/inquiries" onClose={() => setMenuOpen(false)}>
                  My inquiries
                </DropdownItem>
                <DropdownItem href="/me/saved" onClose={() => setMenuOpen(false)}>
                  Saved products
                </DropdownItem>
                <DropdownItem href="/me/requirements" onClose={() => setMenuOpen(false)}>
                  My requirements
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
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="hidden flex-col items-center justify-center gap-0.5 rounded-md px-3 py-1 text-[11px] font-medium text-white/90 hover:bg-white/10 sm:flex"
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function UtilityButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden flex-col items-center justify-center gap-0.5 rounded-md px-3 py-1 text-[11px] font-medium text-white/90 hover:bg-white/10 sm:flex"
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
    </button>
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
/*  Generic outline icons - not reproductions of any branded icon set.      */
/* ------------------------------------------------------------------------ */

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

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
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
