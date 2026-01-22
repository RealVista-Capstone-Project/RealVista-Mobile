import { create } from 'zustand'

type DrawerState = {
  isOpen: boolean
  activeItem: string
  setIsOpen: (isOpen: boolean) => void
  toggleDrawer: () => void
  setActiveItem: (item: string) => void
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  activeItem: 'Dashboard',
  setIsOpen: (isOpen) => set({ isOpen }),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  setActiveItem: (item) => set({ activeItem: item }),
}))
