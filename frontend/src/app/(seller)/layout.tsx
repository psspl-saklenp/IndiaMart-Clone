import { SellerSidebar } from '@/components/layout/seller-sidebar';
import { SellerTopBar } from '@/components/layout/seller-top-bar';
import { Protected } from '@/features/auth/protected';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected allow={['seller', 'admin']}>
      <div className="flex min-h-screen flex-col bg-ink-50">
        <SellerTopBar />
        <div className="mx-auto w-full max-w-[96rem] flex-1 px-4 py-8">
          <div className="flex flex-col gap-6 lg:flex-row">
            <SellerSidebar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </Protected>
  );
}
