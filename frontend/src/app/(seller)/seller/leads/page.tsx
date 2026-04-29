import { SellerLeads } from '@/features/requirements/seller-leads';

export const metadata = { title: 'Buy leads' };

export default function SellerLeadsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Buy leads</h1>
        <p className="mt-1 text-sm text-ink-500">
          Open buyer requirements you can quote on. Responding starts a regular inquiry thread.
        </p>
      </div>
      <SellerLeads />
    </div>
  );
}
