'use client'

import { useQueryClient } from '@tanstack/react-query'

import { NotificationSchema, type Notification } from '@/lib/api/notifications'
import { useSse, type SseStatus } from '@/hooks/useSse'

const MAX_CACHED_NOTIFICATIONS = 100

export function useNotificationLiveFeed(serial: string): SseStatus {
  const queryClient = useQueryClient()

  return useSse<Notification>(
    '/notifications/stream',
    'notification',
    (raw) => {
      const notification = NotificationSchema.safeParse(raw)
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
