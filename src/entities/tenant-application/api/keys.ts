export const tenantApplicationKeys = {
  all: ['tenant-applications'] as const,
  lists: () => [...tenantApplicationKeys.all, 'list'] as const,
  my: () => [...tenantApplicationKeys.lists(), 'my'] as const,
  detail: (id: string) => [...tenantApplicationKeys.all, 'detail', id] as const,
} as const
