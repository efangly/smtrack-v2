import type { Metadata } from 'next'
import { Suspense } from 'react'

import { DeviceSettingsList } from '@/components/features/settings/DeviceSettingsList'
import { SettingsGuard } from '@/components/features/settings/SettingsGuard'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = { title: 'จัดการอุปกรณ์ | SMtrack' }

export default function SettingsDevicesPage() {
  return (
    <SettingsGuard permission="devices">
      <Card
        title="ทะเบียนอุปกรณ์"
        description="เพิ่มและแก้ไขข้อมูลจุดติดตั้ง — ดูสถานะการทำงานได้ที่เมนูอุปกรณ์"
      >
        <Suspense fallback={<span className="loading loading-spinner loading-md" />}>
          <DeviceSettingsList />
        </Suspense>
      </Card>
    </SettingsGuard>
  )
}
