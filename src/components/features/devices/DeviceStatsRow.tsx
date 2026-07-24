'use client'

import { BellRing, Cpu, WifiOff, Wifi } from 'lucide-react'

import { StatCard } from '@/components/ui/StatCard'
import { useDevices } from '@/hooks/useDevices'
import { useNotificationFeedStore } from '@/store/useNotificationFeedStore'

export function DeviceStatsRow() {
  const { data: devices, isLoading, isError } = useDevices()
  const alertCount = useNotificationFeedStore((state) => state.items.length)

  const total = devices?.length ?? 0
  const online = devices?.filter((device) => device.online).length ?? 0
  const offline = total - online
  // ถ้าโหลดไม่สำเร็จให้แสดงขีดแทนตัวเลข ไม่ใช่ค้าง skeleton ไว้
  const show = (value: number) => (isError ? '—' : value)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="จำนวนอุปกรณ์"
        value={show(total)}
        hint={isError ? 'โหลดข้อมูลไม่สำเร็จ' : undefined}
        icon={Cpu}
        loading={isLoading}
      />
      <StatCard
        label="ออนไลน์"
        value={show(online)}
        hint={
          !isError && total > 0
            ? `${Math.round((online / total) * 100)}% ของทั้งหมด`
            : undefined
        }
        icon={Wifi}
        tone="success"
        loading={isLoading}
      />
      <StatCard
        label="ออฟไลน์"
        value={show(offline)}
        icon={WifiOff}
        tone={!isError && offline > 0 ? 'error' : 'neutral'}
        loading={isLoading}
      />
      <StatCard
        label="แจ้งเตือนใหม่"
        value={alertCount}
        hint="นับเฉพาะช่วงที่เปิดแอปนี้"
        icon={BellRing}
        tone={alertCount > 0 ? 'warning' : 'neutral'}
      />
    </div>
  )
}
