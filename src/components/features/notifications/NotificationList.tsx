'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { formatDateTime } from '@/lib/utils'

export function NotificationList({ serial }: { serial: string }) {
  const { data, isLoading, isError } = useNotifications(serial)

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดการแจ้งเตือนได้</p>
  if (!data || data.length === 0)
    return <p className="text-base-content/60">ยังไม่มีการแจ้งเตือน</p>

  return (
    <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto">
      {data.map((notification) => (
        <li
          key={notification.id}
          className="rounded-box border border-base-300 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{notification.message}</span>
            <span className="text-xs text-base-content/60">
              {formatDateTime(notification.createAt)}
            </span>
          </div>
          {notification.detail && (
            <p className="mt-1 text-sm text-base-content/70">
              {notification.detail}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
