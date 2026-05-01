'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { listSavedIds, saveProduct, unsaveProduct } from './api';

export function useSavedSet() {
  const { isAuthenticated, user } = useAuth();
  // Every authenticated user can wishlist products — sellers retain their
  // buyer capabilities after upgrading.
  const enabled = isAuthenticated && Boolean(user);

  return useQuery({
    queryKey: ['saved-ids'],
    queryFn: listSavedIds,
    enabled,
    staleTime: 60_000,
  });
}

interface ToggleVars {
  productId: string;
  save: boolean;
}

interface ToggleCtx {
  previous: string[];
}

export function useToggleSaved() {
  const qc = useQueryClient();

  return useMutation<void, Error, ToggleVars, ToggleCtx>({
    mutationFn: async ({ productId, save }) => {
      if (save) await saveProduct(productId);
      else await unsaveProduct(productId);
    },
    onMutate: async ({ productId, save }) => {
      await qc.cancelQueries({ queryKey: ['saved-ids'] });
      const previous = qc.getQueryData<string[]>(['saved-ids']) ?? [];
      const next = save
        ? [...new Set([...previous, productId])]
        : previous.filter((id) => id !== productId);
      qc.setQueryData<string[]>(['saved-ids'], next);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['saved-ids'], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['saved-ids'] });
      qc.invalidateQueries({ queryKey: ['saved-products'] });
    },
  });
}

export function useIsSaved(productId: string): boolean {
  const { data } = useSavedSet();
  return useMemo(() => (data ?? []).includes(productId), [data, productId]);
}
