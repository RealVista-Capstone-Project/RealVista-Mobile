// Unit tests for getWsEndpoint and handleMessage logic extracted from the hook.
// We test the pure functions via module-level helpers (not the hook directly,
// because hooks require React context).

// --- getWsEndpoint behaviour ---

describe('getWsEndpoint', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.resetModules()
  })

  it('derives ws endpoint from EXPO_PUBLIC_API_URL when WS_ENDPOINT absent', () => {
    process.env.EXPO_PUBLIC_WS_ENDPOINT = ''
    process.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.5:8080/api/v1'
    jest.resetModules()
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getWsEndpointForTest } = require('../use-notification-websocket')
    expect(getWsEndpointForTest()).toBe('ws://192.168.1.5:8080/ws')
  })

  it('does NOT use Constants.expoConfig.hostUri as a fallback (debug IP removed)', () => {
    process.env.EXPO_PUBLIC_WS_ENDPOINT = ''
    process.env.EXPO_PUBLIC_API_URL = ''
    jest.resetModules()
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getWsEndpointForTest } = require('../use-notification-websocket')
    const endpoint = getWsEndpointForTest()
    // Should never be ws://<debugger-ip>:8080 — it should be the static fallback
    expect(endpoint).not.toMatch(/^\s*ws:\/\/\d+\.\d+\.\d+\.\d+:\d+\/ws$/)
    // Falls back to the static placeholder or android emulator address only
    expect(endpoint).toMatch(/^ws:\/\//)
  })
})

// --- dedup: only notification_id used ---

describe('buildDedupId', () => {
  afterEach(() => {
    jest.resetModules()
  })

  it('returns notification_id from snake_case field', () => {
    jest.resetModules()
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { buildDedupIdForTest } = require('../use-notification-websocket')
    const raw = {
      notification_id: 'abc123',
      title: 'T',
      message: 'M',
      event_type: 'SYSTEM',
      user_id: 'u1',
    }
    expect(buildDedupIdForTest(raw)).toBe('abc123')
  })

  it('returns empty string when notification_id absent (no camelCase fallback)', () => {
    jest.resetModules()
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { buildDedupIdForTest } = require('../use-notification-websocket')
    // Old behaviour would fall back to notificationId — new behaviour must NOT
    const raw = {
      notificationId: 'camel',
      title: 'T',
      message: 'M',
      event_type: 'SYSTEM',
      user_id: 'u1',
    }
    expect(buildDedupIdForTest(raw)).toBe('')
  })
})
