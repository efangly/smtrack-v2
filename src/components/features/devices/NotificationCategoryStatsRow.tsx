'use client'

import { DoorOpen, MemoryStick, Plug, Thermometer, WifiOff } from 'lucide-react'

import { StatCard } from '@/components/ui/StatCard'
import { useNotificationDashboardCount } from '@/hooks/useNotificationDashboardCount'

export function NotificationCategoryStatsRow() {
  const { data, isLoading, isError } = useNotificationDashboardCount()

  // ถ้าโหลดไม่สำเร็จให้แสดงขีดแทนตัวเลข ไม่ใช่ค้าง skeleton ไว้
  const show = (value: number | undefined) => (isError || value === undefined ? '—' : value)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label="อุณหภูมิ"
        value={show(data?.temp)}
        hint={isError ? 'โหลดข้อมูลไม่สำเร็จ' : undefined}
        icon={Thermometer}
        tone={!isError && (data?.temp ?? 0) > 0 ? 'error' : 'neutral'}
        loading={isLoading}
      />
      <StatCard
        label="ประตู"
        value={show(data?.door)}
        icon={DoorOpen}
        tone={!isError && (data?.door ?? 0) > 0 ? 'warning' : 'neutral'}
        loading={isLoading}
      />
      <StatCard
        label="การเชื่อมต่อ"
        value={show(data?.internet)}
        icon={WifiOff}
        tone={!isError && (data?.internet ?? 0) > 0 ? 'warning' : 'neutral'}
        loading={isLoading}
      />
      <StatCard
        label="ปลั๊ก"
        value={show(data?.plug)}
        icon={Plug}
        tone={!isError && (data?.plug ?? 0) > 0 ? 'warning' : 'neutral'}
        loading={isLoading}
      />
      <StatCard
        label="เอสดีการ์ด"
        value={show(data?.sdcard)}
        icon={MemoryStick}
        tone={!isError && (data?.sdcard ?? 0) > 0 ? 'warning' : 'neutral'}
        loading={isLoading}
      />
    </div>
  )
}
