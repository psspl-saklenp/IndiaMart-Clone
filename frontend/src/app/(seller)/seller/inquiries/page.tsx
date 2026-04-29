import { InquiryList } from '@/features/inquiries/inquiry-list';

export const metadata = { title: 'Inquiries' };

export default function SellerInquiriesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Inquiries received</h1>
        <p className="mt-1 text-sm text-ink-500">
          Reply, mark as responded, or close threads from buyers.
        </p>
      </div>
      <InquiryList viewer="seller" />
    </div>
  );
}
