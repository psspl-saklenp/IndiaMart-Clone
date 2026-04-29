import { InquiryList } from '@/features/inquiries/inquiry-list';

export const metadata = { title: 'My inquiries' };

export default function BuyerInquiriesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Inquiries you sent</h1>
        <p className="mt-1 text-sm text-ink-500">
          Track replies from suppliers and continue threads.
        </p>
      </div>
      <InquiryList viewer="buyer" />
    </div>
  );
}
