// Confirms that useChatWebSocket maps WS frames using only snake_case fields
// (no senderId / senderName camelCase access)

import { renderHook, act } from '@testing-library/react-native'
import { useChatWebSocket } from '../useChatWebSocket'

jest.mock('@/entities/chat', () => ({
  chatKeys: {
    list: () => ['chats'],
    messages: (id: string) => ['chats', 'messages', id],
  },
}))

jest.mock('@/entities/user', () => ({
  useAuthStore: () => ({ token: 'tok' }),
}))

const mockInvalidateQueries = jest.fn()
const mockSetQueryData = jest.fn()
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
    setQueryData: mockSetQueryData,
  }),
}))

// expo-constants is already mocked globally in jest.setup.js

let capturedOnMessage: ((msg: { body: string }) => void) | null = null
const mockSubscribe = jest.fn((opts: { onMessage: (msg: { body: string }) => void }) => {
  capturedOnMessage = opts.onMessage
  return jest.fn()
})

jest.mock('@/shared/lib/websocket', () => ({
  useWebSocket: () => ({
    isConnected: true,
    send: jest.fn(),
    subscribe: mockSubscribe,
  }),
}))

describe('useChatWebSocket — snake_case field mapping', () => {
  beforeEach(() => {
    mockInvalidateQueries.mockClear()
    mockSetQueryData.mockClear()
    mockSubscribe.mockClear()
    capturedOnMessage = null
  })

  it('maps WS frame using snake_case sender field (not senderId/senderName)', () => {
    renderHook(() => useChatWebSocket())

    expect(capturedOnMessage).not.toBeNull()

    const frame = {
      body: JSON.stringify({
        message_id: 'msg-1',
        conversation_id: 'conv-1',
        reply_to_message_id: null,
        message_type: 'TEXT',
        content: 'Hello',
        metadata: null,
        sender: {
          user_id: 'user-42',
          name: 'Alice',
          avatar_url: null,
        },
        recipient_user_id: 'user-99',
        created_at: '2026-04-13T10:00:00Z',
        conversation_created: false,
      }),
    }

    act(() => {
      capturedOnMessage!(frame)
    })

    // invalidateQueries called for the list query
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['chats'] })

    // setQueryData called with the correct conversation key
    expect(mockSetQueryData).toHaveBeenCalledWith(
      ['chats', 'messages', 'conv-1'],
      expect.any(Function)
    )

    // Verify the updater function maps sender using snake_case
    const updater = mockSetQueryData.mock.calls[0][1]
    const oldData = {
      data: {
        messages: [],
        pagination: {
          has_next: false,
          has_previous: false,
          next_cursor: null,
          previous_cursor: null,
        },
      },
    }
    const newData = updater(oldData)
    const addedMsg = newData.data.messages[0]

    expect(addedMsg.message_id).toBe('msg-1')
    expect(addedMsg.conversation_id).toBe('conv-1')
    expect(addedMsg.sender.user_id).toBe('user-42')
    expect(addedMsg.sender.name).toBe('Alice')
    expect(addedMsg.sender.avatar_url).toBeNull()

    // Ensure no camelCase leakage
    expect((addedMsg as Record<string, unknown>).senderId).toBeUndefined()
    expect((addedMsg as Record<string, unknown>).senderName).toBeUndefined()
  })

  it('skips cache update when conversation_id is absent', () => {
    renderHook(() => useChatWebSocket())

    const frame = {
      body: JSON.stringify({
        message_id: 'msg-2',
        conversation_id: '',
        reply_to_message_id: null,
        message_type: 'TEXT',
        content: 'No conv',
        metadata: null,
        sender: { user_id: 'user-1', name: 'Bob', avatar_url: null },
        recipient_user_id: 'user-99',
        created_at: '2026-04-13T10:00:00Z',
        conversation_created: false,
      }),
    }

    act(() => {
      capturedOnMessage!(frame)
    })

    // List query still invalidated
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['chats'] })
    // But no setQueryData call since conversation_id is falsy
    expect(mockSetQueryData).not.toHaveBeenCalled()
  })
})
