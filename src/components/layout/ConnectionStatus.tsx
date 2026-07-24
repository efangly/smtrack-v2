import { NotificationFeedStatus } from '@/components/features/notifications/NotificationFeedStatus'

/** แถวสถานะ SSE stream กลางของแอปที่ท้าย sidebar */
export function ConnectionStatus() {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-base-content/50">Realtime stream</span>
      <NotificationFeedStatus />
    </div>
  )
}
