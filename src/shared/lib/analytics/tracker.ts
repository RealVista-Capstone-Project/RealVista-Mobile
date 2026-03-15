/**
 * Unified behavior tracker
 * Dual-writes to PostHog (analytics) and BE API (recommendations)
 */

import type PostHog from 'posthog-react-native'

import { enqueueEvent, initEventQueue } from './event-queue'
import { BEHAVIOR_EVENTS, BEHAVIOR_EVENT_TO_API } from './events'
import type { BehaviorEventMetadata } from './types'

let posthogInstance: PostHog | null = null

export const behaviorTracker = {
  init(posthog: PostHog): void {
    posthogInstance = posthog
    initEventQueue()
  },

  trackView(listingId: string, metadata?: BehaviorEventMetadata): void {
    posthogInstance?.capture(BEHAVIOR_EVENTS.LISTING_VIEW, {
      listing_id: listingId,
      ...metadata,
    })

    enqueueEvent({
      event_type: BEHAVIOR_EVENT_TO_API[BEHAVIOR_EVENTS.LISTING_VIEW],
      listing_id: listingId,
      metadata: metadata ? { ...metadata } : null,
    })
  },

  trackClick(listingId: string, metadata?: BehaviorEventMetadata): void {
    posthogInstance?.capture(BEHAVIOR_EVENTS.LISTING_CLICK, {
      listing_id: listingId,
      ...metadata,
    })

    enqueueEvent({
      event_type: BEHAVIOR_EVENT_TO_API[BEHAVIOR_EVENTS.LISTING_CLICK],
      listing_id: listingId,
      metadata: metadata ? { ...metadata } : null,
    })
  },

  trackBookmark(
    listingId: string,
    action: 'add' | 'remove',
    metadata?: BehaviorEventMetadata
  ): void {
    posthogInstance?.capture(BEHAVIOR_EVENTS.LISTING_BOOKMARK, {
      listing_id: listingId,
      action,
      ...metadata,
    })

    // Only send 'add' to BE — removing a bookmark is not a recommendation signal
    if (action === 'add') {
      enqueueEvent({
        event_type: BEHAVIOR_EVENT_TO_API[BEHAVIOR_EVENTS.LISTING_BOOKMARK],
        listing_id: listingId,
        metadata: metadata ? { ...metadata } : null,
      })
    }
  },
}
