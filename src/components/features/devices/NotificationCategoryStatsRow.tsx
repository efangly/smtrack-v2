'use client'

import { StatCard } from '@/components/ui/StatCard'
import { useNotificationDashboardCount } from '@/hooks/useNotificationDashboardCount'
import {
  CATEGORY_ACCENT_CLASS,
  NOTIFICATION_FILTERS,
  type NotificationCategory,
} from '@/lib/notificationType'
import type { NotificationDashboardCount } from '@/lib/api/notifications'

// icon/สี ดึงจากตารางกลางที่ไฟล์เดียว (NOTIFICATION_FILTERS + CATEGORY_ACCENT_CLASS)
// ส่วน label เก็บไว้เองเพราะหน้า dashboard ใช้คำที่ต่างจากตัวกรองในหน้าแจ้งเตือน
const CATEGORIES: {
  category: Extract<
    NotificationCategory,
    'temp' | 'door' | 'internet' | 'plug' | 'sdcard'
  >
  label: string
  field: keyof NotificationDashboardCount
}[] = [
  { category: 'temp', label: 'อุณหภูมิ', field: 'temp' },
  { category: 'door', label: 'ประตู', field: 'door' },
  { category: 'internet', label: 'การเชื่อมต่อ', field: 'internet' },
  { category: 'plug', label: 'ปลั๊ก', field: 'plug' },
  { category: 'sdcard', label: 'เอสดีการ์ด', field: 'sdcard' },
]

export function NotificationCategoryStatsRow() {
  const { data, isLoading, isError } = useNotificationDashboardCount()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {CATEGORIES.map(({ category, label, field }) => {
        const filter = NOTIFICATION_FILTERS.find((f) => f.value === category)!
        const count = data?.[field]

        return (
          <StatCard
            key={category}
            label={label}
            // ถ้าโหลดไม่สำเร็จให้แสดงขีดแทนตัวเลข ไม่ใช่ค้าง skeleton ไว้
            value={isError || count === undefined ? '—' : count}
            hint={isError ? 'โหลดข้อมูลไม่สำเร็จ' : undefined}
            icon={filter.icon}
            accentClass={CATEGORY_ACCENT_CLASS[category]}
            quiet={isError || (count ?? 0) === 0}
            loading={isLoading}
          />
        )
      })}
    </div>
  )
}
