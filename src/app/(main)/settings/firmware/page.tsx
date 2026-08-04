import type { Metadata } from 'next'
import { Suspense } from 'react'

import { FirmwareList } from '@/components/features/settings/FirmwareList'
import { SettingsGuard } from '@/components/features/settings/SettingsGuard'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = { title: 'จัดการเฟิร์มแวร์ | SMtrack' }

export default function SettingsFirmwarePage() {
  return (
    <SettingsGuard permission="firmware">
      <Card
        title="เฟิร์มแวร์"
        description="อัปโหลดและจัดการเวอร์ชันเฟิร์มแวร์สำหรับอุปกรณ์"
      >
        <Suspense fallback={<span className="loading loading-spinner loading-md" />}>
          <FirmwareList />
        </Suspense>
      </Card>
    </SettingsGuard>
  )
}
