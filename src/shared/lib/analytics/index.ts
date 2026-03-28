/**
 * Public API for analytics module
 */

export { behaviorTracker } from './tracker'
export { flushEventQueue, destroyEventQueue } from './event-queue'
export type { BehaviorEventMetadata } from './types'
export { BEHAVIOR_EVENTS } from './events'
