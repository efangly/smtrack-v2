'use client'

import Link from 'next/link'

import { formatDateTime, formatTimeShort } from '@/lib/utils'
import { useNotificationFeedStore } from '@/store/useNotificationFeedStore'

export function RecentNotificationsTicker() {
  // อ่านจาก store กลาง — EventSource ตัวจริงอยู่ที่ RealtimeFeedProvider
  const items = useNotificationFeedStore((state) => state.items)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-8 text-center">
        <p className="text-sm text-base-content/60">รอรับการแจ้งเตือนใหม่</p>
        <p className="text-xs text-base-content/40">
          แสดงเฉพาะที่เข้ามาระหว่างเปิดหน้านี้
        </p>
      </div>
    )
  }

  return (
    <ul className="flex max-h-96 flex-col gap-3 overflow-y-auto scrollbar-slim pr-1">
      {items.map((notification) => (
        <li key={notification.id} className="flex gap-3">
          <div className="flex flex-col items-center pt-1.5">
            <span className="status-dot text-warning" />
            <span className="mt-1 w-px flex-1 bg-base-300" />
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/devices/${encodeURIComponent(notification.serial)}`}
                className="link link-hover truncate font-mono text-xs text-base-content/70"
              >
                {notification.serial}
              </Link>
              <span
                className="shrink-0 text-xs text-base-content/50"
                title={formatDateTime(notification.createAt)}
              >
                {formatTimeShort(notification.createAt)}
              </span>
            </div>
            <p className="truncate text-sm font-medium">
              {notification.message}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
