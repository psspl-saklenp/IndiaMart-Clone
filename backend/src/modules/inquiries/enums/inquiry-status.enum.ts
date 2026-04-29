export enum InquiryStatus {
  NEW = 'new',
  RESPONDED = 'responded',
  CLOSED = 'closed',
}

export const INQUIRY_STATUSES: readonly InquiryStatus[] = [
  InquiryStatus.NEW,
  InquiryStatus.RESPONDED,
  InquiryStatus.CLOSED,
] as const;
