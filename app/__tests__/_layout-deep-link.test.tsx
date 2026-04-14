// Test the deep-link routing logic extracted as a pure function from _layout.tsx

import { resolveDeepLinkRoute } from '../_layout'

describe('resolveDeepLinkRoute', () => {
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

  it('routes APPOINTMENT to /appointments', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'APPOINTMENT',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'appt-1',
    })
    expect(result).toEqual({ pathname: '/appointments', params: { entity_id: 'appt-1' } })
  })

  it('routes LISTING to /property/[id]', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'LISTING',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'listing-5',
    })
    expect(result).toEqual({ pathname: '/property/[id]', params: { id: 'listing-5' } })
  })

  it('routes PROPERTY to /property/[id]', () => {
    const result = resolveDeepLinkRoute({
      event_type: 'PROPERTY',
      propertyId: undefined,
      roomName: undefined,
      entity_id: 'prop-9',
    })
    expect(result).toEqual({ pathname: '/property/[id]', params: { id: 'prop-9' } })
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
