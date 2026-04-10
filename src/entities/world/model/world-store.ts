import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { MarbleWorld, WorldStatus } from './types'

const STORAGE_KEY = 'marble-worlds'

type WorldState = {
  worlds: MarbleWorld[]
  currentGeneration: MarbleWorld | null

  startGeneration: (world: MarbleWorld) => void
  updateUploadProgress: (current: number, total: number) => void
  updateStatus: (status: WorldStatus) => void
  setOperationId: (operationId: string, worldId: string) => void
  markComplete: (world: MarbleWorld) => void
  markFailed: (error: { code: number; message: string }) => void
  clearCurrentGeneration: () => void
  getWorldById: (id: string) => MarbleWorld | undefined
}

export const useWorldStore = create<WorldState>()(
  persist(
    (set, get) => ({
      worlds: [],
      currentGeneration: null,

      startGeneration: (world) => {
        set({ currentGeneration: world })
      },

      updateUploadProgress: (current, total) => {
        const gen = get().currentGeneration
        if (!gen) return
        set({
          currentGeneration: { ...gen, uploadProgress: { current, total } },
        })
      },

      updateStatus: (status) => {
        const gen = get().currentGeneration
        if (!gen) return
        set({
          currentGeneration: { ...gen, status },
        })
      },

      setOperationId: (operationId, worldId) => {
        const gen = get().currentGeneration
        if (!gen) return
        set({
          currentGeneration: {
            ...gen,
            id: worldId,
            operationId,
            status: 'generating',
          },
        })
      },

      markComplete: (completedWorld) => {
        const { worlds } = get()
        const existing = worlds.findIndex((w) => w.id === completedWorld.id)
        const updatedWorlds =
          existing >= 0
            ? worlds.map((w) => (w.id === completedWorld.id ? completedWorld : w))
            : [completedWorld, ...worlds]

        set({
          currentGeneration: completedWorld,
          worlds: updatedWorlds,
        })
      },

      markFailed: (error) => {
        const gen = get().currentGeneration
        if (!gen) return
        set({
          currentGeneration: { ...gen, status: 'failed', error },
        })
      },

      clearCurrentGeneration: () => {
        set({ currentGeneration: null })
      },

      getWorldById: (id) => {
        return get().worlds.find((w) => w.id === id)
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        worlds: state.worlds,
      }),
    }
  )
)
