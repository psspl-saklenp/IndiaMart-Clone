import { api } from '@/lib/axios';
import type {
  SearchParams,
  SearchResponse,
  SuggestResponse,
} from '@/types/search';

export async function search(params: SearchParams): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>('/search', { params });
  return data;
}

export async function suggest(q: string): Promise<SuggestResponse> {
  const { data } = await api.get<SuggestResponse>('/search/suggest', {
    params: { q },
  });
  return data;
}
