import type { ApiMeta } from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  iconUrl: string | null;
  position: number;
  description: string | null;
  children?: Category[];
}

export type StockStatus = 'in_stock' | 'out_of_stock' | 'made_to_order';

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  position: number;
  altText: string | null;
}

export interface ProductSellerSummary {
  id: string;
  name: string;
  companyName: string | null;
  isVerifiedSupplier: boolean;
}

export interface ProductCategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  specifications: Record<string, string> | null;
  price: string;
  currency: string;
  minOrderQty: number;
  unit: string;
  stockStatus: StockStatus;
  isActive: boolean;
  viewCount: number;
  inquiryCount: number;
  category: ProductCategorySummary;
  seller: ProductSellerSummary;
  images: ProductImage[];
  createdAt: string;
}

export interface PaginatedProducts {
  data: Product[];
  meta: ApiMeta;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  category?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: StockStatus;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateProductPayload {
  name: string;
  categoryId: string;
  description: string;
  specifications?: Record<string, string>;
  price: number;
  currency?: string;
  minOrderQty?: number;
  unit?: string;
  stockStatus?: StockStatus;
  isActive?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface AttachImagePayload {
  s3Key?: string;
  url: string;
  isPrimary?: boolean;
  position?: number;
  altText?: string;
}

export interface PresignUploadPayload {
  fileName: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  purpose?: 'product-image' | 'avatar' | 'banner';
}

export interface PresignUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  s3Key: string;
  contentType: string;
  expiresIn: number;
}

export interface SellerSummary {
  id: string;
  slug: string;
  name: string;
  companyName: string | null;
  isVerifiedSupplier: boolean;
  ratingAvg: string;
  ratingCount: number;
  logoUrl: string | null;
  businessType: string | null;
  establishedYear: number | null;
}

export interface SellerProfile extends SellerSummary {
  bannerUrl: string | null;
  description: string | null;
  productCount: number;
  products: Product[];
}

export interface PaginatedSellers {
  data: SellerSummary[];
  meta: ApiMeta;
}

export interface ListSellersParams {
  page?: number;
  limit?: number;
  q?: string;
  verified?: boolean;
}
