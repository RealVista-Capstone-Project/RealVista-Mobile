import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { appointmentApi, BookTourRequest } from '@/entities/appointment'

export const appointmentKeys = {
  all: ['appointments'] as const,
  slots: (listingId: string, date: string) =>
    [...appointmentKeys.all, 'slots', listingId, date] as const,
}

export function useAvailableSlots(listingId: string, date: string) {
  return useQuery({
    queryKey: appointmentKeys.slots(listingId, date),
    queryFn: () => appointmentApi.getAvailableSlots(listingId, date),
    enabled: !!listingId && !!date,
  })
}

export function useBookTour() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BookTourRequest) => appointmentApi.bookTour(data),
    onSuccess: (_, variables) => {
      // Extract date from the first slot to invalidate queries
      if (variables.selected_slots && variables.selected_slots.length > 0) {
        const firstSlotDate = variables.selected_slots[0].split('T')[0]
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.slots(variables.listing_id, firstSlotDate),
        })
      }
    },
  })
}
