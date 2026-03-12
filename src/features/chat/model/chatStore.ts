// Imports removed
import type { Listing } from '@/entities/listing'
import { create } from 'zustand'

interface ChatStoreState {
  isContactModalOpen: boolean
  selectedListing: Listing | null
  activeConversationId: string | null
  openModal: (listing: Listing) => void
  closeModal: () => void
  setActiveConversation: (conversationId: string | null) => void
}

export const useChatStore = create<ChatStoreState>((set) => ({
  isContactModalOpen: false,
  selectedListing: null,
  activeConversationId: null,
  openModal: (listing) => set({ isContactModalOpen: true, selectedListing: listing }),
  closeModal: () => set({ isContactModalOpen: false, selectedListing: null }),
  setActiveConversation: (activeConversationId) => set({ activeConversationId }),
}))
