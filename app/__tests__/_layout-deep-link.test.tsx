// Test the deep-link routing logic extracted as a pure function from _layout.tsx

import { resolveDeepLinkRoute } from '../_layout'

describe('resolveDeepLinkRoute', () => {
  // ── 3D / Virtual Tour ──────────────────────────────────────────────────────

  it('routes PROPERTY_3D_GENERATED to /world-viewer using entity_id as propertyId', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'PROPERTY_3D_GENERATED',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'prop-42',
    })
    expect(result).toEqual({ pathname: '/world-viewer', params: { propertyId: 'prop-42' } })
  })

  it('routes PROPERTY_3D_GENERATED prefers explicit propertyId over entity_id', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'PROPERTY_3D_GENERATED',
      propertyId: 'p-explicit',
      roomName: 'main',
      entity_id: 'prop-42',
    })
    expect(result).toEqual({
      pathname: '/world-viewer',
      params: { propertyId: 'p-explicit', roomName: 'main' },
    })
  })

  it('routes VIRTUAL_TOUR to /world-viewer', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'VIRTUAL_TOUR',
      propertyId: 'p1',
      roomName: 'main',
      entity_id: undefined,
    })
    expect(result).toEqual({
      pathname: '/world-viewer',
      params: { propertyId: 'p1', roomName: 'main' },
    })
  })

  it('routes 3D_VIEW to /world-viewer', () => {
    const result = resolveDeepLinkRoute({
      event_type: '3D_VIEW',
      propertyId: 'p2',
      roomName: undefined,
      entity_id: undefined,
    })
    expect(result).toEqual({ pathname: '/world-viewer', params: { propertyId: 'p2' } })
  })

  // ── Appointments ───────────────────────────────────────────────────────────

  it('routes NEW_TOUR_REQUEST (BE event for property owner) to /appointments', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'NEW_TOUR_REQUEST',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'appt-99',
    })
    expect(result).toEqual({ pathname: '/appointments', params: { entity_id: 'appt-99' } })
  })

  it('routes APPOINTMENT to /appointments', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'APPOINTMENT',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'appt-1',
    })
    expect(result).toEqual({ pathname: '/appointments', params: { entity_id: 'appt-1' } })
  })

  it('routes APPOINTMENT_REMINDER to /appointments', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'APPOINTMENT_REMINDER',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'appt-2',
    })
    expect(result).toEqual({ pathname: '/appointments', params: { entity_id: 'appt-2' } })
  })

  it('routes APPOINTMENT_CONFIRMED to /appointments', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'APPOINTMENT_CONFIRMED',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'appt-3',
    })
    expect(result).toEqual({ pathname: '/appointments', params: { entity_id: 'appt-3' } })
  })

  it('routes APPOINTMENT_CANCELLED to /appointments', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'APPOINTMENT_CANCELLED',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'appt-4',
    })
    expect(result).toEqual({ pathname: '/appointments', params: { entity_id: 'appt-4' } })
  })

  // ── Listings ───────────────────────────────────────────────────────────────

  it('routes NEW_LISTING to /listing/[id]', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'NEW_LISTING',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'listing-5',
    })
    expect(result).toEqual({ pathname: '/listing/[id]', params: { id: 'listing-5' } })
  })

  it('routes PRICE_CHANGE to /listing/[id]', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'PRICE_CHANGE',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'listing-6',
    })
    expect(result).toEqual({ pathname: '/listing/[id]', params: { id: 'listing-6' } })
  })

  it('routes LISTING to /listing/[id]', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'LISTING',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'listing-5',
    })
    expect(result).toEqual({ pathname: '/listing/[id]', params: { id: 'listing-5' } })
  })

  it('routes PROPERTY to /listing/[id]', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'PROPERTY',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'prop-9',
    })
    expect(result).toEqual({ pathname: '/listing/[id]', params: { id: 'prop-9' } })
  })

  // ── Fallback ───────────────────────────────────────────────────────────────

  it('routes unknown event_type to /(tabs)', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'SYSTEM',
      propertyId: undefined,
      roomName: undefined,
      entity_id: undefined,
    })
    expect(result).toEqual({ pathname: '/(tabs)', params: {} })
  })

  it('routes undefined event_type to /(tabs)', () => {
    const result = resolveDeepLinkRoute({
      event_type: undefined,
      propertyId: undefined,
      roomName: undefined,
      entity_id: undefined,
    })
    expect(result).toEqual({ pathname: '/(tabs)', params: {} })
  })
})
