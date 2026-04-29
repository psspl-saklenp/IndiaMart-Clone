'use client';

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';
import { getCounts } from './api';

const REFRESH_MS = 60_000;

export function useInquiryCounts() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['inquiry-counts'],
    queryFn: getCounts,
    enabled: isAuthenticated,
    refetchInterval: REFRESH_MS,
    staleTime: REFRESH_MS / 2,
  });
}
