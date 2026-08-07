import type { Metadata } from 'next'
import { Suspense } from 'react'

import { FirmwareList } from '@/components/features/settings/FirmwareList'
import { SettingsGuard } from '@/components/features/settings/SettingsGuard'

export const metadata: Metadata = { title: 'จัดการเฟิร์มแวร์ | SMtrack' }

export default function SettingsFirmwarePage() {
  return (
    <SettingsGuard permission="firmware">
      <Suspense fallback={<span className="loading loading-spinner loading-md" />}>
        <FirmwareList />
      </Suspense>
    </SettingsGuard>
  )
}
