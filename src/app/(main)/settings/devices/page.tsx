import type { Metadata } from 'next'
import { Suspense } from 'react'

import { DeviceSettingsList } from '@/components/features/settings/DeviceSettingsList'
import { SettingsGuard } from '@/components/features/settings/SettingsGuard'

export const metadata: Metadata = { title: 'จัดการอุปกรณ์ | SMtrack' }

export default function SettingsDevicesPage() {
  return (
    <SettingsGuard permission="devices">
      <Suspense fallback={<span className="loading loading-spinner loading-md" />}>
        <DeviceSettingsList />
      </Suspense>
    </SettingsGuard>
  )
}
