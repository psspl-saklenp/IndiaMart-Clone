import Link from 'next/link';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Protected } from '@/features/auth/protected';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected allow={['buyer', 'admin']}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <aside className="mb-6 flex flex-wrap items-center gap-3 border-b border-ink-200 pb-4">
            <p className="text-xs uppercase tracking-wide text-ink-500">My account</p>
            <nav className="flex flex-wrap gap-3 text-sm">
              <Link href="/me/dashboard" className="text-ink-700 hover:text-brand-700">
                Dashboard
              </Link>
              <Link href="/me/inquiries" className="text-ink-700 hover:text-brand-700">
                Inquiries
              </Link>
              <Link href="/me/saved" className="text-ink-700 hover:text-brand-700">
                Saved
              </Link>
              <Link href="/me/requirements" className="text-ink-700 hover:text-brand-700">
                Requirements
              </Link>
              <Link href="/requirements/new" className="text-brand-700 hover:underline">
                + Post requirement
              </Link>
            </nav>
          </aside>
          {children}
        </main>
        <Footer />
      </div>
    </Protected>
  );
}
