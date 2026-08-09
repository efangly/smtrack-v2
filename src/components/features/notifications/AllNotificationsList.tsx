'use client'

import { Pagination } from '@/components/ui/Pagination'
import { useAllNotifications } from '@/hooks/useNotifications'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import {
  CATEGORY_ACCENT_CLASS,
  classifyNotification,
  TONE_CLASS,
} from '@/lib/notificationType'
import { formatDateTime } from '@/lib/utils'

export function AllNotificationsList({ filter }: { filter?: string }) {
  const { page, limit, setPage, setLimit } = usePaginationParams(
    'notifications',
    { defaultLimit: 10 },
  )
  const { data, isLoading, isError } = useAllNotifications({
    page,
    limit,
    filter,
  })

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดการแจ้งเตือนได้</p>
  if (!data || data.data.length === 0)
    return <p className="text-base-content/60">ยังไม่มีการแจ้งเตือน</p>

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {data.data.map((notification) => {
          const {
            icon: Icon,
            tone,
            category,
          } = classifyNotification(notification.message)
          return (
            <li
              key={notification.id}
              // แถบซ้ายบอกหมวด ส่วนความเข้มบอกว่าเป็นเหตุผิดปกติหรือกลับสู่ปกติ
              data-accent={tone === 'error' ? 'active' : 'quiet'}
              className={`accent-bar rounded-box border border-base-300 p-3 pl-4 ${CATEGORY_ACCENT_CLASS[category]}`}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${TONE_CLASS[tone]}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span className="badge badge-ghost badge-sm font-mono">
                        {notification.serial}
                      </span>
                      <span className="font-medium">
                        {notification.message}
                      </span>
                    </span>
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
        totalItems={data.meta.total}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  )
}
