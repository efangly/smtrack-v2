'use client'

import { LiveStatus } from '@/components/ui/LiveStatus'
import { useNotificationFeedStore } from '@/store/useNotificationFeedStore'

/** สถานะของ stream กลาง สำหรับวางเป็น action ของการ์ด */
export function NotificationFeedStatus() {
  const status = useNotificationFeedStore((state) => state.status)

  return <LiveStatus status={status} />
}
