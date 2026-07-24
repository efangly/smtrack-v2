'use client'

import { LiveStatus } from '@/components/ui/LiveStatus'
import { useNotificationLiveFeed } from '@/hooks/useNotificationLiveFeed'

export function NotificationLiveFeed({ serial }: { serial: string }) {
  const status = useNotificationLiveFeed(serial)

  return <LiveStatus status={status} />
}
