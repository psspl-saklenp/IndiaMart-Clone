import { InquiryList } from '@/features/inquiries/inquiry-list';

export const metadata = { title: 'Admin · Inquiries' };

export default function AdminInquiriesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Inquiries</h1>
        <p className="mt-1 text-sm text-ink-500">
          Backend role-scopes for admins to all inquiries. Click a row to read the thread.
        </p>
      </div>
      <InquiryList viewer="seller" />
    </div>
  );
}
