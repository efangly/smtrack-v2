import { X } from 'lucide-react'
import toast, { type Toast } from 'react-hot-toast'

import type { Notification } from '@/lib/api/notifications'
import { classifyNotification, TONE_CLASS } from '@/lib/notificationType'

export function NotificationToastBody({
  t,
  notification,
}: {
  t: Toast
  notification: Notification
}) {
  const { icon: Icon, tone } = classifyNotification(notification.message)

  return (
    <div
      className={`card surface-card w-80 border border-base-300 shadow-lg ${
        t.visible ? 'animate-enter' : 'animate-leave'
      }`}
      role="status"
      onClick={() => toast.dismiss(t.id)}
    >
      <div className="card-body gap-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="badge badge-ghost badge-sm font-mono">
            {notification.serial}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-circle"
            aria-label="ปิด"
            onClick={(e) => {
              e.stopPropagation()
              toast.dismiss(t.id)
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-start gap-2">
          <Icon
            className={`mt-0.5 h-4 w-4 shrink-0 ${TONE_CLASS[tone]}`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
            {notification.detail && (
              <p className="line-clamp-2 text-xs text-base-content/60">
                {notification.detail}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
