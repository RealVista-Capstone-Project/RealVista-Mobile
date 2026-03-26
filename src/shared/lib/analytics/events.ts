/**
 * Behavior event type constants and mappings
 * Maps FE event names to BE API event_type values
 */

export const BEHAVIOR_EVENTS = {
  LISTING_VIEW: 'listing_view',
  LISTING_CLICK: 'listing_click',
  LISTING_BOOKMARK: 'listing_bookmark',
} as const

export type BehaviorEventType = (typeof BEHAVIOR_EVENTS)[keyof typeof BEHAVIOR_EVENTS]

/** Maps FE event types to BE event_type values */
export const BEHAVIOR_EVENT_TO_API: Record<BehaviorEventType, string> = {
  listing_view: 'view',
  listing_click: 'click',
  listing_bookmark: 'bookmark',
}
