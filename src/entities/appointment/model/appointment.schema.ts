export interface BookTourRequest {
  listing_id: string
  selected_slots: string[] // ISO strings
  notes?: string
}
