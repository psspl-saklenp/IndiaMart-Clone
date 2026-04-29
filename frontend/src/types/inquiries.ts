import type { ApiMeta } from './api';

export type InquiryStatus = 'new' | 'responded' | 'closed';

export interface InquiryUserSummary {
  id: string;
  name: string;
  email: string | null;
}

export interface InquiryProductSummary {
  id: string;
  name: string;
  slug: string;
  primaryImageUrl: string | null;
}

export interface InquiryMessage {
  id: string;
  inquiryId: string;
  senderUserId: string;
  senderName: string;
  senderRole: 'buyer' | 'seller' | 'admin';
  message: string;
  createdAt: string;
}

export interface InquirySummary {
  id: string;
  subject: string;
  status: InquiryStatus;
  buyer: InquiryUserSummary;
  seller: InquiryUserSummary;
  product: InquiryProductSummary | null;
  messageCount: number;
  unreadForViewer: boolean;
  lastMessageAt: string;
  createdAt: string;
}

export interface InquiryDetail extends InquirySummary {
  message: string;
  quantity: number | null;
  unit: string | null;
  expectedPrice: string | null;
  messages: InquiryMessage[];
}

export interface PaginatedInquiries {
  data: InquirySummary[];
  meta: ApiMeta;
}

export interface CreateInquiryPayload {
  sellerId: string;
  productId?: string;
  subject: string;
  message: string;
  quantity?: number;
  unit?: string;
  expectedPrice?: number;
}

export interface AddMessagePayload {
  message: string;
}

export interface InquiryCounts {
  asBuyer: number;
  asSeller: number;
}
