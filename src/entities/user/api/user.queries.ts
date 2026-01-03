import { queryOptions } from '@tanstack/react-query';
import { userApi } from './index';
import { userKeys } from './keys';

/**
 * User Query Factory
 * TanStack Query v5 queryOptions for type-safe queries
 */
export const userQueries = {
  all: () =>
    queryOptions({
      queryKey: userKeys.all,
      queryFn: () => userApi.getCurrent().then((res) => res.payload),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  current: () =>
    queryOptions({
      queryKey: userKeys.current(),
      queryFn: () => userApi.getCurrent().then((res) => res.payload),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: userKeys.detail(id),
      queryFn: () => userApi.getById(id).then((res) => res.payload),
      enabled: !!id,
    }),
} as const;
