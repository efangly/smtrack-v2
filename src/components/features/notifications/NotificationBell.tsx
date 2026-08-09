'use client'

import Link from 'next/link'
import { Bell, BellOff } from 'lucide-react'

import { Dropdown } from '@/components/ui/Dropdown'
import {
  CATEGORY_ACCENT_CLASS,
  classifyNotification,
  TONE_CLASS,
} from '@/lib/notificationType'
import { formatDateTime, formatTimeShort } from '@/lib/utils'
import { useMarkAllNotificationsRead } from '@/hooks/useNotifications'
import { useNotificationFeedStore } from '@/store/useNotificationFeedStore'

export function NotificationBell() {
  const items = useNotificationFeedStore((state) => state.items)
  const unreadCount = useNotificationFeedStore((state) => state.unreadCount)
  const markAllRead = useMarkAllNotificationsRead()

  return (
    <Dropdown
      ariaLabel="การแจ้งเตือน"
      onOpen={() => markAllRead.mutate()}
      panelClassName="w-80 sm:w-96"
      trigger={
        <span className="indicator">
          {unreadCount > 0 && (
            <span className="indicator-item badge badge-error badge-xs px-1 font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <Bell className="h-5 w-5" aria-hidden="true" />
        </span>
      }
    >
      {(close) => (
        <>
          <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
            {/* ห้ามใช้คำว่า "การแจ้งเตือนล่าสุด" ซ้ำกับหัวการ์ดในหน้าภาพรวม */}
            <span className="font-semibold">ศูนย์การแจ้งเตือน</span>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <BellOff
                className="h-6 w-6 text-base-content/30"
                aria-hidden="true"
              />
              <p className="text-sm text-base-content/60">
                ยังไม่มีการแจ้งเตือนใหม่
              </p>
            </div>
          ) : (
            <ul className="scrollbar-slim max-h-80 divide-y divide-base-300 overflow-y-auto">
              {items.map((notification) => {
                const {
                  icon: Icon,
                  tone,
                  category,
                } = classifyNotification(notification.message)
                return (
                  <li key={notification.id}>
                    <Link
                      href={`/notifications?serial=${encodeURIComponent(notification.serial)}`}
                      data-accent={tone === 'error' ? 'active' : 'quiet'}
                      className={`accent-bar flex items-start gap-2 px-4 py-3 pl-5 transition-colors hover:bg-base-200 ${CATEGORY_ACCENT_CLASS[category]}`}
                      onClick={close}
                    >
                      <Icon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${TONE_CLASS[tone]}`}
                        aria-hidden="true"
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="badge badge-ghost badge-sm font-mono">
                            {notification.serial}
                          </span>
                          <span
                            className="text-xs text-base-content/50"
                            title={formatDateTime(notification.createAt)}
                          >
                            {formatTimeShort(notification.createAt)}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {notification.message}
                        </span>
                        {notification.detail && (
                          <span className="line-clamp-2 text-xs text-base-content/60">
                            {notification.detail}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="border-t border-base-300 p-2">
            <Link
              href="/notifications"
              className="btn btn-ghost btn-sm w-full"
              onClick={close}
            >
              ดูทั้งหมด
            </Link>
          </div>
        </>
      )}
    </Dropdown>
  )
}
