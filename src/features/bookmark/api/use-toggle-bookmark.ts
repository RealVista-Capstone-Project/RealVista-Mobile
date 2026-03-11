import { useMutation, useQueryClient } from '@tanstack/react-query'

import { bookmarkApi, bookmarkKeys } from '@/entities/bookmark'

export function useToggleBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (listingId: string) => bookmarkApi.toggle(listingId).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookmarkKeys.all })
    },
  })
}
