'use client'

import { Pagination } from '@/components/ui/Pagination'
import { useNotifications } from '@/hooks/useNotifications'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import { classifyNotification, TONE_CLASS } from '@/lib/notificationType'
import { formatDateTime } from '@/lib/utils'

export function NotificationList({
  serial,
  filter,
}: {
  serial: string
  /** category จาก classifyNotification เช่น 'door' — ไม่ใช่ backend ?filter=
   * เพราะ GET /notifications/:serial ไม่รองรับ query นี้ ต้องกรองฝั่ง client เอง
   * บนชุดข้อมูล ≤100 รายการที่ endpoint นี้คืนมา */
  filter?: string
}) {
  const { page, limit, setPage, setLimit } = usePaginationParams(
    'notifications',
    {
      defaultLimit: 10,
    },
  )
  const { data, isLoading, isError } = useNotifications(serial, {
    page,
    limit,
  })
  const hasNextPage = (data?.length ?? 0) === limit
  const filtered =
    filter && filter !== 'all'
      ? data?.filter(
          (notification) =>
            classifyNotification(notification.message).category === filter,
        )
      : data

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดการแจ้งเตือนได้</p>
  if (!filtered || filtered.length === 0)
    return <p className="text-base-content/60">ยังไม่มีการแจ้งเตือน</p>

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {filtered.map((notification) => {
          const { icon: Icon, tone } = classifyNotification(
            notification.message,
          )
          return (
            <li
              key={notification.id}
              className="rounded-box border border-base-300 p-3"
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${TONE_CLASS[tone]}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
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
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <Pagination
        page={page}
        limit={limit}
        hasNextPage={hasNextPage}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  )
}
