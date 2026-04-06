import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

import { useWorldStore } from '@/entities/world'
import { propertyApi } from '@/entities/property'
import type { Property3dOperation } from '@/entities/property'
import { type MarbleModel } from '@/shared/api/marble-client'
import { NotificationService } from '@/shared/services/notification'

type GenerationPhase = 'idle' | 'uploading' | 'requesting' | 'polling' | 'succeeded' | 'failed'

type GenerationState = {
  phase: GenerationPhase
  propertyId: string | null
  progressDescription: string
  error: string | null
}

const POLL_INTERVAL_MS = 10000

export function useGenerateWorld() {
  const [state, setState] = useState<GenerationState>({
    phase: 'idle',
    propertyId: null,
    progressDescription: '',
    error: null,
  })

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isForegroundRef = useRef(true)
  const propertyIdRef = useRef<string | null>(null)

  const { markComplete, markFailed } = useWorldStore()

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  const handleOperationResult = useCallback(
    (op: Property3dOperation) => {
      if (op.status === 'FAILED') {
        const errorMsg = op.errorMessage || 'World generation failed'
        setState((prev) => ({ ...prev, phase: 'failed', error: errorMsg }))
        markFailed({ code: 500, message: errorMsg })
        stopPolling()
        return
      }

      if (op.status === 'SUCCEEDED') {
        setState((prev) => ({
          ...prev,
          phase: 'succeeded',
          progressDescription: 'World generation complete!',
        }))

        // Send notification if in background
        if (!isForegroundRef.current) {
          NotificationService.scheduleLocalNotification(
            '3D World Ready!',
            'Your 3D tour has been generated successfully.',
            { propertyId: propertyIdRef.current }
          )
        }

        markComplete({
          id: op.operationId,
          displayName: 'Property 3D World',
          status: 'ready',
          operationId: op.operationId,
          model: 'Marble 0.1-mini',
          createdAt: op.createdAt ?? new Date().toISOString(),
        })

        stopPolling()
        return
      }

      // Still PENDING
      setState((prev) => ({
        ...prev,
        phase: 'polling',
        progressDescription: 'Backend is processing your 3D generation...',
      }))
    },
    [markComplete, markFailed, stopPolling]
  )

  const pollOperation = useCallback(
    async (propId: string) => {
      try {
        const res = await propertyApi.get3dOperations(propId)
        // Backend may return data in ApiResponse wrapper or array directly
        const ops: Property3dOperation[] = Array.isArray(res.data)
          ? res.data
          : ((res.data as unknown as Property3dOperation[]) ?? [])

        // Find the latest pending or most recent operation
        const pendingOp = ops.find((o) => o.status === 'PENDING')
        const latestOp = pendingOp || ops[0]

        if (latestOp) {
          handleOperationResult(latestOp)
        }
      } catch {
        // Silently retry on next poll interval
      }
    },
    [handleOperationResult]
  )

  const startPolling = useCallback(
    (propId: string) => {
      stopPolling()
      propertyIdRef.current = propId

      // Immediate first poll
      pollOperation(propId)

      pollTimerRef.current = setInterval(() => {
        if (isForegroundRef.current) {
          pollOperation(propId)
        }
      }, POLL_INTERVAL_MS)
    },
    [pollOperation, stopPolling]
  )

  // AppState listener: pause/resume polling
  useEffect(() => {
    const handleAppState = (next: AppStateStatus) => {
      const wasForeground = isForegroundRef.current
      isForegroundRef.current = next === 'active'

      // Resumed from background → immediate poll
      if (!wasForeground && isForegroundRef.current && propertyIdRef.current) {
        pollOperation(propertyIdRef.current)
      }
    }

    const sub = AppState.addEventListener('change', handleAppState)
    return () => {
      sub.remove()
      stopPolling()
    }
  }, [pollOperation, stopPolling])

  /**
   * Start the generation flow via the RealVista Backend.
   * After images have been uploaded to Marble (by useUploadImages),
   * this sends the mediaAssetIds to our backend which orchestrates
   * the Marble generation and tracks the operation.
   */
  const startGeneration = useCallback(
    async (params: {
      propertyId: string
      images: { mediaAssetId: string; azimuth: number }[]
      displayName?: string
      model?: MarbleModel
      roomName?: string
    }) => {
      setState({
        phase: 'requesting',
        propertyId: params.propertyId,
        progressDescription: 'Submitting 3D generation request to backend...',
        error: null,
      })

      try {
        await propertyApi.initiate3dOperation(params.propertyId, {
          model: params.model ?? 'Marble 0.1-mini',
          display_name: params.displayName,
          room_name: params.roomName,
          images: params.images.map((img) => ({
            media_asset_id: img.mediaAssetId,
            azimuth: img.azimuth,
          })),
        })

        // Switch to polling
        setState((prev) => ({
          ...prev,
          phase: 'polling',
          progressDescription:
            'Generation accepted! Backend is processing. You can safely leave this screen.',
        }))

        startPolling(params.propertyId)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to start generation'
        setState((prev) => ({ ...prev, phase: 'failed', error: message }))
        markFailed({ code: 500, message })
      }
    },
    [startPolling, markFailed]
  )

  /**
   * Resume tracking an existing pending operation for a property.
   * Called when user returns to the property and it has a PENDING status.
   */
  const resumePolling = useCallback(
    (propId: string) => {
      setState({
        phase: 'polling',
        propertyId: propId,
        progressDescription: 'Resuming generation tracking...',
        error: null,
      })
      startPolling(propId)
    },
    [startPolling]
  )

  return {
    ...state,
    startGeneration,
    resumePolling,
    stopPolling,
  }
}
