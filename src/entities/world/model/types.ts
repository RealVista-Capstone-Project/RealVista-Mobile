import type { MarbleModel, WorldAssets } from '@/shared/api/marble-client'

export type WorldStatus = 'uploading' | 'generating' | 'ready' | 'failed'

export type MarbleWorld = {
  id: string
  displayName: string
  status: WorldStatus
  operationId?: string
  thumbnailUrl?: string
  spzUrls?: {
    '100k': string
    '500k': string
    full_res: string
  }
  marbleUrl?: string
  panoUrl?: string
  caption?: string
  model: MarbleModel
  createdAt: string
  error?: { code: number; message: string }
  uploadProgress?: { current: number; total: number }
  assets?: WorldAssets
}

export type WorldGenerationParams = {
  displayName: string
  model: MarbleModel
  textPrompt?: string
}
