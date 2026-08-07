'use client'

import { create } from 'zustand'

import type { Notification } from '@/lib/api/notifications'
import type { SseStatus } from '@/hooks/useSse'

export const MAX_FEED_ITEMS = 20

interface NotificationFeedState {
  items: Notification[]
  unreadCount: number
  status: SseStatus
  push: (notification: Notification) => void
  // ตั้งค่าตรง ๆ จากแหล่งที่ authoritative กว่า session counter ในตัว store เอง —
  // ใช้ seed ค่าตอนเปิดแอป (GET /notifications/unread-count) และ sync ตอนได้ event
  // อ่านแล้วผ่าน SSE (action:'read'/'read-all' หรือ unreadCount ที่แนบมากับ notification ใหม่)
  setUnreadCount: (count: number) => void
  setStatus: (status: SseStatus) => void
}

export const useNotificationFeedStore = create<NotificationFeedState>(
  (set) => ({
    items: [],
    unreadCount: 0,
    status: 'connecting',
    push: (notification) =>
      set((state) => ({
        items: [notification, ...state.items].slice(0, MAX_FEED_ITEMS),
        unreadCount: state.unreadCount + 1,
      })),
    setUnreadCount: (count) => set({ unreadCount: count }),
    setStatus: (status) => set({ status }),
  }),
)
