import { api } from '@/lib/axios';
import type {
  CreateRequirementPayload,
  ListRequirementsParams,
  PaginatedRequirements,
  Requirement,
  RespondPayload,
} from '@/types/engagement';

export async function listRequirements(
  params: ListRequirementsParams = {},
): Promise<PaginatedRequirements> {
  const { data } = await api.get<PaginatedRequirements>('/requirements', { params });
  return data;
}

export async function listMyRequirements(): Promise<Requirement[]> {
  const { data } = await api.get<Requirement[]>('/requirements/mine');
  return data;
}

export async function getRequirement(id: string): Promise<Requirement> {
  const { data } = await api.get<Requirement>(`/requirements/${id}`);
  return data;
}

export async function createRequirement(
  payload: CreateRequirementPayload,
): Promise<Requirement> {
  const { data } = await api.post<Requirement>('/requirements', payload);
  return data;
}

export async function closeRequirement(id: string): Promise<Requirement> {
  const { data } = await api.patch<Requirement>(`/requirements/${id}/close`);
  return data;
}

export async function respondToRequirement(
  id: string,
  payload: RespondPayload,
): Promise<{ inquiryId: string }> {
  const { data } = await api.post<{ inquiryId: string }>(
    `/requirements/${id}/respond`,
    payload,
  );
  return data;
}
