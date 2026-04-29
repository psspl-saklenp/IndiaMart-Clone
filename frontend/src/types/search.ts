import type { ApiMeta } from './api';
import type {
  Category,
  Product,
  SellerSummary,
  StockStatus,
} from './catalog';

export type SearchType = 'all' | 'products' | 'suppliers' | 'categories';

export interface ProductSuggestion {
  id: string;
  slug: string;
  name: string;
  primaryImageUrl: string | null;
  price: string;
  currency: string;
}

export interface SupplierSuggestion {
  id: string;
  slug: string;
  name: string;
  companyName: string | null;
  isVerifiedSupplier: boolean;
}

export interface CategorySuggestion {
  id: string;
  slug: string;
  name: string;
  parentSlug: string | null;
}

export interface SuggestResponse {
  q: string;
  products: ProductSuggestion[];
  suppliers: SupplierSuggestion[];
  categories: CategorySuggestion[];
}

export interface SearchResponse {
  q: string;
  type: SearchType;
  products?: { data: Product[]; meta: ApiMeta };
  suppliers?: { data: SellerSummary[]; meta: ApiMeta };
  categories?: Category[];
}

export interface SearchParams {
  q: string;
  type?: SearchType;
  page?: number;
  limit?: number;
  stockStatus?: StockStatus;
}
