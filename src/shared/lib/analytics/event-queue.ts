/**
 * Event queue for batching behavior events
 * Flushes when queue reaches MAX_QUEUE_SIZE or every FLUSH_INTERVAL_MS
 * Also flushes when app goes to background
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState, type AppStateStatus } from 'react-native'

import { useAuthStore } from '@/entities/user'
import { getHttpBaseUrl } from '@/shared/lib/http'
import type { BehaviorEventDTO } from './types'

const MAX_QUEUE_SIZE = 5
const FLUSH_INTERVAL_MS = 10_000

let queue: BehaviorEventDTO[] = []
let timer: ReturnType<typeof setInterval> | null = null
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null
let initialized = false

async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem('token')
}

async function sendEvents(events: BehaviorEventDTO[]): Promise<void> {
  if (events.length === 0) return

  const token = await getAuthToken()
  if (!token) {
    console.warn('[EventQueue] No auth token — skipping flush of', events.length, 'events')
    return
  }

  const userId = useAuthStore.getState().userId
  const effectiveUserId = userId ?? 'mobile-client'

  try {
    const response = await fetch(`${getHttpBaseUrl()}/recommendations/behavior`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: effectiveUserId, events }),
    })
    console.log(
      '[EventQueue] Flushed',
      events.length,
      'events for user_id=',
      effectiveUserId,
      '— HTTP',
      response.status
    )
  } catch (err) {
    console.warn('[EventQueue] Failed to send behavior events', err)
  }
}

export function enqueueEvent(event: BehaviorEventDTO): void {
  queue.push(event)
  if (queue.length >= MAX_QUEUE_SIZE) {
    flushEventQueue()
  }
}

export function flushEventQueue(): void {
  if (queue.length === 0) return
  const events = [...queue]
  queue = []
  sendEvents(events)
}

export function initEventQueue(): void {
  // Guard against duplicate timers / listeners if init is called more than once
  if (initialized) return
  initialized = true

  // Periodic flush
  timer = setInterval(flushEventQueue, FLUSH_INTERVAL_MS)

  // Flush when app goes to background — keep subscription ref for cleanup
  appStateSubscription = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'background' || state === 'inactive') {
      flushEventQueue()
    }
  })
}

export function destroyEventQueue(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  // Remove the AppState listener to prevent leaks
  appStateSubscription?.remove()
  appStateSubscription = null

  initialized = false

  flushEventQueue()
}
