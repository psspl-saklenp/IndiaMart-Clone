import { GuestBanner } from '@/components/guest-banner';
import { BuyerFooter } from '@/components/layout/buyer-footer';
import { PublicNavbar } from '@/components/layout/public-navbar';

/**
 * Public browsing shell — no auth required.
 * Wraps the homepage, product detail, category, supplier profile,
 * search results, and the public requirements feed.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <PublicNavbar />
      <GuestBanner />
      <main className="mx-auto w-full max-w-[96rem] flex-1 px-4 py-6">{children}</main>
      <BuyerFooter />
    </div>
  );
}
