import type { Listing } from '@/entities/listing'
import { create } from 'zustand'

interface ChatStoreState {
  isContactModalOpen: boolean
  selectedListing: Listing | null
  openModal: (listing: Listing) => void
  closeModal: () => void
}

export const useChatStore = create<ChatStoreState>((set) => ({
  isContactModalOpen: false,
  selectedListing: null,
  openModal: (listing) => set({ isContactModalOpen: true, selectedListing: listing }),
  closeModal: () => set({ isContactModalOpen: false, selectedListing: null }),
}))
