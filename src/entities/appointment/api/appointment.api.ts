import http from '@/shared/lib/http'
import { BookTourRequest } from '../model/appointment.schema'

export const appointmentApi = {
  getAvailableSlots: async (listingId: string, date: string) => {
    // date format: YYYY-MM-DD
    const response = await http.get<{ data: string[] }>(
      `/appointments/slots?listing_id=${listingId}&date=${date}`
    )
    return response.data
  },

  bookTour: async (data: BookTourRequest): Promise<void> => {
    await http.post('/appointments', data)
  },
}
