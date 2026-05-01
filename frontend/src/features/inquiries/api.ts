import { api } from '@/lib/axios';
import type {
  AddMessagePayload,
  CreateInquiryPayload,
  InquiryCounts,
  InquiryDetail,
  InquiryMessage,
  InquiryStatus,
  PaginatedInquiries,
} from '@/types/inquiries';

export interface ListInquiriesParams {
  page?: number;
  limit?: number;
  status?: InquiryStatus;
  /**
   * Restrict the listing to one side of the conversation. Omit to fetch
   * every inquiry the viewer participates in (useful for admins or
   * combined inboxes).
   */
  side?: 'buyer' | 'seller';
}

export async function listInquiries(
  params: ListInquiriesParams = {},
): Promise<PaginatedInquiries> {
  const { data } = await api.get<PaginatedInquiries>('/inquiries', { params });
  return data;
}

export async function getInquiry(id: string): Promise<InquiryDetail> {
  const { data } = await api.get<InquiryDetail>(`/inquiries/${id}`);
  return data;
}

export async function createInquiry(payload: CreateInquiryPayload): Promise<InquiryDetail> {
  const { data } = await api.post<InquiryDetail>('/inquiries', payload);
  return data;
}

export async function addMessage(
  id: string,
  payload: AddMessagePayload,
): Promise<InquiryMessage> {
  const { data } = await api.post<InquiryMessage>(`/inquiries/${id}/messages`, payload);
  return data;
}

export async function updateStatus(id: string, status: InquiryStatus): Promise<InquiryDetail> {
  const { data } = await api.patch<InquiryDetail>(`/inquiries/${id}/status`, { status });
  return data;
}

export async function getCounts(): Promise<InquiryCounts> {
  const { data } = await api.get<InquiryCounts>('/inquiries/counts');
  return data;
}
