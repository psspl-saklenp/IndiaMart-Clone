import { BuyerAppBar } from '@/components/layout/buyer-app-bar';
import { BuyerFooter } from '@/components/layout/buyer-footer';
import { BuyerSidebar } from '@/components/layout/buyer-sidebar';
import { TrackOrderFab } from '@/components/layout/track-order-fab';
import { Protected } from '@/features/auth/protected';

/**
 * Buyer-area shell: navy app bar + left rail + main content + footer +
 * floating quick-actions. Open to every authenticated user — the buyer
 * experience is the default for buyers, sellers, and admins alike. Sellers
 * jump into their seller dashboard explicitly via the "Sell" button.
 */
export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected allow={['buyer', 'seller', 'admin']}>
      <div className="flex min-h-screen flex-col bg-ink-50">
        <BuyerAppBar />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
          <div className="flex flex-col gap-6 lg:flex-row">
            <BuyerSidebar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
        <BuyerFooter />
        <TrackOrderFab />
      </div>
    </Protected>
  );
}
