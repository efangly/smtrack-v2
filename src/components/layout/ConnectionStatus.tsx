import { NotificationFeedStatus } from '@/components/features/notifications/NotificationFeedStatus'

/** แถวสถานะ SSE stream + เลขเวอร์ชันแอปที่ท้าย sidebar */
export function ConnectionStatus() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-base-content/50">Realtime stream</span>
        <NotificationFeedStatus />
      </div>
      <span className="text-xs text-base-content/40">
        v{process.env.NEXT_PUBLIC_APP_VERSION}
      </span>
    </div>
  )
}
