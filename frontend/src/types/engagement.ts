import type { ApiMeta } from './api';

export type RequirementStatus = 'open' | 'closed';

export interface RequirementBuyer {
  id: string;
  name: string;
}

export interface RequirementCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  status: RequirementStatus;
  quantity: number | null;
  unit: string | null;
  expectedPrice: string | null;
  locationCity: string | null;
  responseCount: number;
  createdAt: string;
  buyer: RequirementBuyer;
  category: RequirementCategory;
}

export interface PaginatedRequirements {
  data: Requirement[];
  meta: ApiMeta;
}

export interface CreateRequirementPayload {
  title: string;
  categoryId: string;
  description: string;
  quantity?: number;
  unit?: string;
  expectedPrice?: number;
  locationCity?: string;
}

export interface ListRequirementsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: RequirementStatus;
}

export interface RespondPayload {
  message: string;
}
