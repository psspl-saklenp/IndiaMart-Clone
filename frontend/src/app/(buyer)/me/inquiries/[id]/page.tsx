import { InquiryThread } from '@/features/inquiries/inquiry-thread';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Inquiry' };

export default async function BuyerInquiryDetailPage({ params }: Props) {
  const { id } = await params;
  return <InquiryThread id={id} viewer="buyer" />;
}
