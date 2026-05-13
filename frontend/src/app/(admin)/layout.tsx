'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Protected } from '@/features/auth/protected';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/sellers', label: 'Suppliers', icon: '🏪' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { href: '/admin/inquiries', label: 'Inquiries', icon: '💬' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Protected allow={['admin']}>
      <div className="flex min-h-screen flex-col bg-ink-50">
        <Navbar />
        <div className="mx-auto w-full max-w-[96rem] flex-1 px-4 py-6">
          {/* Admin top nav */}
          <div className="mb-6 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-ink-100 bg-gradient-to-r from-ink-900 to-ink-800 px-5 py-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-sm" aria-hidden>⚙️</span>
              <span className="text-sm font-bold text-white">Admin Panel</span>
              <span className="ml-auto rounded-lg bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-300">
                Admin only
              </span>
            </div>
            <nav className="flex flex-wrap gap-1 p-2">
              {NAV.map((n) => {
                const active = pathname === n.href || pathname.startsWith(n.href + '/');
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                    )}
                  >
                    <span aria-hidden>{n.icon}</span>
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <main>{children}</main>
        </div>
        <Footer />
      </div>
    </Protected>
  );
}
