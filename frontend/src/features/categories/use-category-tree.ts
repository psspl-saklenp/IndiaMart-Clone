'use client';

import { useQuery } from '@tanstack/react-query';

import { listCategoryTree } from './api';

/**
 * Shared TanStack Query hook for the navbar mega-menu and any other surface
 * that needs the full category tree. 5-minute staleTime — categories rarely change.
 */
export function useCategoryTree() {
  return useQuery({
    queryKey: ['categories-tree'],
    queryFn: listCategoryTree,
    staleTime: 5 * 60_000,
  });
}
