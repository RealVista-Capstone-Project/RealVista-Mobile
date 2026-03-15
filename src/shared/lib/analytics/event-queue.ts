/**
 * Event queue for batching behavior events
 * Flushes when queue reaches MAX_QUEUE_SIZE or every FLUSH_INTERVAL_MS
 * Also flushes when app goes to background
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState, type AppStateStatus } from 'react-native'

import type { BehaviorEventDTO } from './types'

const MAX_QUEUE_SIZE = 5
const FLUSH_INTERVAL_MS = 10_000

let queue: BehaviorEventDTO[] = []
let timer: ReturnType<typeof setInterval> | null = null

function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
}

async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem('token')
}

async function sendEvents(events: BehaviorEventDTO[]): Promise<void> {
  if (events.length === 0) return

  const token = await getAuthToken()
  if (!token) return

  try {
    await fetch(`${getApiBaseUrl()}/recommendations/behavior`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: 'mobile-client', events }),
    })
  } catch {
    console.warn('[EventQueue] Failed to send behavior events')
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
  // Periodic flush
  timer = setInterval(flushEventQueue, FLUSH_INTERVAL_MS)

  // Flush when app goes to background
  AppState.addEventListener('change', (state: AppStateStatus) => {
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
  flushEventQueue()
}
