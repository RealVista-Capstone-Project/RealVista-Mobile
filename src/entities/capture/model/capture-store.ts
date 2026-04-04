import { create } from 'zustand'

import { type CapturedImage, type CoverageLevel, getCoverageLevel, TOTAL_SLOTS } from './types'

type CaptureState = {
  capturedSlots: Set<string>
  images: CapturedImage[]
  progress: number
  coverageLevel: CoverageLevel

  markCaptured: (slot: string, image: CapturedImage) => void
  reset: () => void
  getOutputPayload: () => { images: CapturedImage[]; poses: { yaw: number; pitch: number }[] }
}

export const useCaptureStore = create<CaptureState>((set, get) => ({
  capturedSlots: new Set<string>(),
  images: [],
  progress: 0,
  coverageLevel: 'low',

  markCaptured: (slot, image) => {
    const { capturedSlots, images } = get()
    if (capturedSlots.has(slot)) return

    const newSlots = new Set(capturedSlots)
    newSlots.add(slot)
    const newImages = [...images, image]
    const newProgress = newSlots.size / TOTAL_SLOTS

    set({
      capturedSlots: newSlots,
      images: newImages,
      progress: newProgress,
      coverageLevel: getCoverageLevel(newProgress),
    })
  },

  reset: () =>
    set({
      capturedSlots: new Set<string>(),
      images: [],
      progress: 0,
      coverageLevel: 'low',
    }),

  getOutputPayload: () => {
    const { images } = get()
    return {
      images,
      poses: images.map(({ yaw, pitch }) => ({ yaw, pitch })),
    }
  },
}))
