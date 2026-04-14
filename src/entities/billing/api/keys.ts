export const billingKeys = {
  all: ['billing'] as const,
  mySubscriptions: () => [...billingKeys.all, 'my-subscriptions'] as const,
} as const
