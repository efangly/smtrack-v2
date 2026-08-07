'use client'

import { useQueryClient } from '@tanstack/react-query'

import {
  NotificationCreatedEventSchema,
  type Notification,
} from '@/lib/api/notifications'
import { useSse, type SseStatus } from '@/hooks/useSse'

const MAX_CACHED_NOTIFICATIONS = 100

export function useNotificationLiveFeed(serial: string): SseStatus {
  const queryClient = useQueryClient()

  return useSse<Notification>(
    '/notifications/stream',
    'notification',
    (raw) => {
      // event นี้อาจเป็นการเปลี่ยนสถานะอ่านแล้ว (action: 'read'|'read-all', ไม่มี serial)
      // ไม่ใช่แจ้งเตือนใหม่ — ข้ามไปเลย ไม่เกี่ยวกับ cache ของรายการ notification ต่อ serial
      if (raw && typeof raw === 'object' && 'action' in raw) return

      const notification = NotificationCreatedEventSchema.safeParse(raw)
      if (!notification.success || notification.data.serial !== serial) return

      queryClient.setQueryData<Notification[]>(
        ['notifications', serial],
        (old) =>
          old
            ? [notification.data, ...old].slice(0, MAX_CACHED_NOTIFICATIONS)
            : [notification.data],
      )
    },
  )
}
