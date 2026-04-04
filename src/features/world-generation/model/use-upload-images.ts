import { useCallback, useRef, useState } from 'react'

import { type CapturedImage } from '@/entities/capture'
import { useWorldStore } from '@/entities/world'
import { MarbleApiError, uploadCapturedImage } from '@/shared/api/marble-client'

type UploadedAsset = {
  mediaAssetId: string
  azimuth: number
}

type UploadState = {
  isUploading: boolean
  currentIndex: number
  totalImages: number
  error: string | null
}

const MAX_RETRIES = 2

export function useUploadImages() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    currentIndex: 0,
    totalImages: 0,
    error: null,
  })

  const abortRef = useRef(false)
  const updateUploadProgress = useWorldStore((s) => s.updateUploadProgress)

  const uploadAll = useCallback(
    async (images: CapturedImage[]): Promise<UploadedAsset[] | null> => {
      abortRef.current = false

      setState({
        isUploading: true,
        currentIndex: 0,
        totalImages: images.length,
        error: null,
      })

      const results: UploadedAsset[] = []

      for (let i = 0; i < images.length; i++) {
        if (abortRef.current) {
          setState((prev) => ({ ...prev, isUploading: false, error: 'Upload cancelled' }))
          return null
        }

        const image = images[i]
        setState((prev) => ({ ...prev, currentIndex: i + 1 }))
        updateUploadProgress(i + 1, images.length)

        let lastError: Error | null = null

        for (let retry = 0; retry <= MAX_RETRIES; retry++) {
          try {
            console.log(`[Upload] Starting upload for image ${i + 1}/${images.length}...`)
            const mediaAssetId = await uploadCapturedImage(image.path, i)
            console.log(
              `[Upload] Image ${i + 1} finished successfully. AssetID: "${mediaAssetId}" (type: ${typeof mediaAssetId})`
            )
            if (!mediaAssetId) {
              throw new Error(`Upload returned empty media_asset_id for image ${i + 1}`)
            }
            results.push({
              mediaAssetId,
              azimuth: image.yaw,
            })
            lastError = null
            break
          } catch (error) {
            lastError = error as Error
            const isRetryable = error instanceof MarbleApiError && error.retryable

            if (!isRetryable || retry === MAX_RETRIES) break

            // Exponential backoff: 1s, 2s
            await new Promise((r) => setTimeout(r, 1000 * (retry + 1)))
          }
        }

        if (lastError) {
          const message =
            lastError instanceof MarbleApiError
              ? lastError.message
              : `Failed to upload image ${i + 1}: ${lastError.message}`

          setState((prev) => ({ ...prev, isUploading: false, error: message }))
          return null
        }
      }

      setState((prev) => ({ ...prev, isUploading: false }))
      return results
    },
    [updateUploadProgress]
  )

  const cancel = useCallback(() => {
    abortRef.current = true
  }, [])

  return {
    ...state,
    uploadAll,
    cancel,
  }
}
