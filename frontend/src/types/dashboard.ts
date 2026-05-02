export interface SellerStats {
  totalProducts: number;
  activeProducts: number;
  totalViews: number;
  totalInquiries: number;
  last30dInquiries: number;
  prev30dInquiries: number;
  openInquiries: number;
  respondedInquiries: number;
  conversionRate: number;
}

export interface TimeseriesPoint {
  date: string;
  count: number;
}

export interface DashboardTopProduct {
  id: string;
  slug: string;
  name: string;
  viewCount: number;
  inquiryCount: number;
  primaryImageUrl: string | null;
}

export interface MyProfile {
  id: string;
  slug: string;
  companyName: string;
  businessType: string | null;
  establishedYear: number | null;
  description: string | null;
  gstNumber: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  isVerifiedSupplier: boolean;
  ratingAvg: string;
  ratingCount: number;
}

export interface UpdateMyProfilePayload {
  companyName?: string;
  businessType?: string;
  establishedYear?: number;
  description?: string;
  gstNumber?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

/**
 * Result row returned by the buyer-facing "Know Your Seller" lookup.
 * Surfaces the seller's contact + business details so a buyer can verify
 * the supplier before reaching out.
 */
export interface KnownSellerLookup {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string;
  gstNumber: string | null;
}
