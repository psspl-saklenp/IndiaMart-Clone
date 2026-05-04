import Link from 'next/link';

import { SellerTopBar } from '@/components/layout/seller-top-bar';
import { Protected } from '@/features/auth/protected';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected allow={['seller', 'admin']}>
      <SellerTopBar />
      <div className="mx-auto max-w-[96rem] px-4 py-8">
        <aside className="mb-6 flex flex-wrap items-center gap-3 border-b border-ink-200 pb-4">
          <p className="text-xs uppercase tracking-wide text-ink-500">Seller</p>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link href="/seller/dashboard" className="text-ink-700 hover:text-brand-700">
              Dashboard
            </Link>
            <Link href="/seller/products" className="text-ink-700 hover:text-brand-700">
              Products
            </Link>
            <Link
              href="/seller/products/new"
              className="text-ink-700 hover:text-brand-700"
            >
              + New product
            </Link>
            <Link href="/seller/inquiries" className="text-ink-700 hover:text-brand-700">
              Inquiries
            </Link>
            <Link href="/seller/leads" className="text-ink-700 hover:text-brand-700">
              Buy leads
            </Link>
            {/* Profile lives on the shared buyer page so the seller and
                buyer share one Business Details surface. */}
            <Link href="/me/profile" className="text-ink-700 hover:text-brand-700">
              Profile
            </Link>
          </nav>
        </aside>
        {children}
      </div>
    </Protected>
  );
}
