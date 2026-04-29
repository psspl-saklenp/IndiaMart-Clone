import Link from 'next/link';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Protected } from '@/features/auth/protected';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/sellers', label: 'Suppliers' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/inquiries', label: 'Inquiries' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected allow={['admin']}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <aside className="mb-6 flex flex-wrap items-center gap-3 border-b border-ink-200 pb-4">
            <p className="text-xs uppercase tracking-wide text-ink-500">Admin</p>
            <nav className="flex flex-wrap gap-3 text-sm">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="text-ink-700 hover:text-brand-700">
                  {n.label}
                </Link>
              ))}
            </nav>
          </aside>
          {children}
        </main>
        <Footer />
      </div>
    </Protected>
  );
}
