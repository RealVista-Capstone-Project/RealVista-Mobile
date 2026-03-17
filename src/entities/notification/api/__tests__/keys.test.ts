import { notificationKeys } from '../keys'

describe('notificationKeys', () => {
  describe('query key factory', () => {
    it('should generate correct all key', () => {
      expect(notificationKeys.all).toEqual(['notifications'])
    })

    it('should generate correct lists key', () => {
      expect(notificationKeys.lists()).toEqual(['notifications', 'list'])
    })

    it('should generate correct list key with page', () => {
      expect(notificationKeys.list(1)).toEqual(['notifications', 'list', 1])
      expect(notificationKeys.list(2)).toEqual(['notifications', 'list', 2])
    })

    it('should generate correct unread count key', () => {
      expect(notificationKeys.unreadCount()).toEqual(['notifications', 'unread-count'])
    })

    it('should generate correct detail key', () => {
      expect(notificationKeys.detail('123')).toEqual(['notifications', 'detail', '123'])
    })
  })

  describe('key hierarchy', () => {
    it('should maintain proper key hierarchy', () => {
      const allKey = notificationKeys.all
      const listsKey = notificationKeys.lists()
      const listKey = notificationKeys.list(1)

      // Lists should start with all
      expect(listsKey[0]).toBe(allKey[0])

      // List should start with lists
      expect(listKey.slice(0, 2)).toEqual(listsKey)
    })
  })
})
