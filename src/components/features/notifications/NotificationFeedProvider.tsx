'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { NotificationSchema, type Notification } from '@/lib/api/notifications'
import { useSse } from '@/hooks/useSse'
import { useNotificationFeedStore } from '@/store/useNotificationFeedStore'

/**
 * เจ้าของ EventSource ตัวเดียวของทั้งแอปสำหรับ stream การแจ้งเตือนรวม
 * component อื่น (bell, ticker) อ่านผลผ่าน useNotificationFeedStore แทนการเปิด SSE ซ้ำ
 */
export function NotificationFeedProvider({
  children,
}: {
  children: ReactNode
}) {
  const push = useNotificationFeedStore((state) => state.push)
  const setStatus = useNotificationFeedStore((state) => state.setStatus)

  const status = useSse<Notification>(
    '/notifications/stream',
    'notification',
    (raw) => {
      const parsed = NotificationSchema.safeParse(raw)
      if (!parsed.success) return
      push(parsed.data)
    },
  )

  useEffect(() => {
    setStatus(status)
  }, [status, setStatus])

  return <>{children}</>
}
